/**
 * src/app/api/generate/route.ts
 *
 * POST /api/generate
 *
 * Receives a pipeline generation request, enqueues it via the global PQueue
 * (concurrency: 1) to protect Groq's TPM limits, builds provider-specific
 * prompts via the prompt engineering module, calls the Groq chat completions
 * API, and returns the generated configuration text.
 */

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import queue from "@/lib/queue";
import { buildPrompts } from "@/lib/prompts";
import type { CIProvider, Infrastructure, RepoType, OutputType } from "@/types/pipeline";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerateRequest {
  repoType: RepoType;
  ciProvider: CIProvider;
  infrastructure: Infrastructure[];
  customRequirements: string;
  outputType: OutputType;
  baseImage?: string;
  databases?: string[];
  proxyServer?: string;
}

export interface GenerateResponse {
  output: string;
}

export interface GenerateError {
  error: string;
}

// ---------------------------------------------------------------------------
// Groq client — instantiated once per module lifecycle
// ---------------------------------------------------------------------------

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "qwen/qwen3.8-27b";

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest
): Promise<NextResponse<GenerateResponse | GenerateError>> {
  // ── Parse & validate body ─────────────────────────────────────────────────
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { 
    repoType, 
    ciProvider, 
    infrastructure, 
    customRequirements, 
    outputType,
    baseImage,
    databases,
    proxyServer
  } = body;

  // We only require repoType and ciProvider if they are generating a ci-pipeline
  if (outputType === "ci-pipeline" && (!repoType || !ciProvider)) {
    return NextResponse.json(
      { error: "Missing required fields: repoType and ciProvider for CI Pipeline." },
      { status: 400 }
    );
  }

  // Default outputType to ci-pipeline if not provided
  const resolvedOutputType: OutputType = outputType || "ci-pipeline";

  // ── Build prompts via prompt engineering module ────────────────────────────
  const { systemPrompt, userPrompt } = buildPrompts({
    repoType,
    ciProvider,
    infrastructure: infrastructure ?? [],
    customRequirements: customRequirements ?? "",
    outputType: resolvedOutputType,
    baseImage,
    databases: databases ?? [],
    proxyServer,
  });

  // ── Enqueue Groq call ─────────────────────────────────────────────────────
  try {
    const output = await queue.add(async () => {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.15, // Low temp for deterministic, precise config output
        max_tokens: 8192,  // Increased for complex multi-stage pipelines
        top_p: 0.9,
      });

      return completion.choices[0]?.message?.content ?? "";
    });

    // Sanitize: strip any accidental markdown fences the model may include
    const sanitized = sanitizeOutput(output as string);

    return NextResponse.json({ output: sanitized });
  } catch (err: unknown) {
    console.error("[/api/generate] Groq error:", err);

    // Handle Groq rate-limit errors (HTTP 429)
    if (isGroqRateLimitError(err)) {
      return NextResponse.json(
        {
          error:
            "Rate limit reached — Groq is processing too many requests. " +
            "The queue is holding your request. Please wait 60 seconds and try again.",
        },
        { status: 429 }
      );
    }

    // Handle auth errors
    if (isGroqAuthError(err)) {
      return NextResponse.json(
        {
          error:
            "Authentication failed — please check your GROQ_API_KEY in .env.local.",
        },
        { status: 401 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while generating the configuration. " +
          "Please check your API key and try again.",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strips markdown code fences that the model may hallucinate despite the
 * system prompt instructions, so the Monaco editor always receives clean text.
 */
function sanitizeOutput(raw: string): string {
  let cleaned = raw;

  // Remove any leading text before the actual config (e.g. "Here is your config:\n")
  // Detect common preamble patterns
  cleaned = cleaned.replace(/^[\s\S]*?(?=(?:name:|stages:|version:|pipeline\s*\{|FROM\s|server\s*\{|#\s*---|---\n))/i, "");

  // Remove opening fence (```yaml, ```yml, ```dockerfile, etc.)
  cleaned = cleaned.replace(/^```[a-z]*\n?/i, "");
  // Remove closing fence
  cleaned = cleaned.replace(/\n?```\s*$/i, "");

  // If we accidentally stripped everything, return the original
  if (cleaned.trim().length === 0) {
    cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/i, "");
  }

  return cleaned.trim();
}

/**
 * Type-guard for Groq rate-limit (HTTP 429) errors.
 */
function isGroqRateLimitError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as Record<string, unknown>;
  return e["status"] === 429 || e["statusCode"] === 429;
}

/**
 * Type-guard for Groq authentication (HTTP 401/403) errors.
 */
function isGroqAuthError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as Record<string, unknown>;
  return e["status"] === 401 || e["status"] === 403;
}
