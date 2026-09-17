/**
 * src/app/api/generate/route.ts
 *
 * POST /api/generate
 *
 * SSE handler that generates CI/CD configs or Dockerfiles, lints them,
 * and self-heals errors via a loop before returning the final result.
 */

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import queue from "@/lib/queue";
import { buildPrompts } from "@/lib/prompts";
import type { CIProvider, Infrastructure, RepoType, OutputType } from "@/types/pipeline";
import { validate as validateDockerfile } from "dockerfile-utils";
import YAML from "yaml";

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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "openai/gpt-oss-120b";
const MAX_RETRIES = 3;

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  const { repoType, ciProvider, infrastructure, customRequirements, outputType, baseImage, databases, proxyServer } = body;
  const resolvedOutputType: OutputType = outputType || "ci-pipeline";

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

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: string, data: any) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        await queue.add(async () => {
          let currentOutput = "";
          let attempt = 0;
          let isValid = false;

          let currentMessages: any[] = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ];

          sendEvent("status", { status: "generating" });

          while (attempt <= MAX_RETRIES && !isValid) {
            if (attempt > 0) {
              sendEvent("status", { status: "self_healing", attempt });
            }

            const completion = await groq.chat.completions.create({
              model: MODEL,
              messages: currentMessages,
              temperature: 0.15,
              max_tokens: 1000,
              top_p: 0.9,
            });

            currentOutput = sanitizeOutput(completion.choices[0]?.message?.content ?? "");

            sendEvent("status", { status: "linting" });
            const errors = validateOutput(currentOutput, resolvedOutputType);

            if (errors.length === 0) {
              isValid = true;
            } else {
              attempt++;
              if (attempt <= MAX_RETRIES) {
                // Add the response and the error back to the context to self-heal
                currentMessages.push({ role: "assistant", content: currentOutput });
                currentMessages.push({
                  role: "user",
                  content: `The generated code failed validation with the following errors:\n${errors.join("\n")}\n\nPlease analyze the errors, fix the configuration, and return ONLY the corrected raw code without markdown wrappers or conversational text.`,
                });
              }
            }
          }

          if (isValid) {
            sendEvent("success", { output: currentOutput });
          } else {
            // Failed after all retries, return the best effort with a warning
            sendEvent("success", { 
              output: currentOutput, 
              warning: `Could not fully resolve all linter errors after ${MAX_RETRIES} attempts.` 
            });
          }
        });
      } catch (err: any) {
        console.error("[/api/generate] Error:", err);
        sendEvent("error", { 
          message: err?.status === 429 
            ? "Rate limit reached. Please wait 60 seconds." 
            : err?.status === 401 ? "Authentication failed. Check API key." 
            : "An unexpected error occurred." 
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateOutput(content: string, type: OutputType): string[] {
  const errors: string[] = [];

  if (type === "dockerfile") {
    const res = validateDockerfile(content);
    if (res && res.length > 0) {
      errors.push(...res.map((e: any) => `Line ${e.instructionLine || 'unknown'}: ${e.message}`));
    }
  } else if (type === "ci-pipeline" || type === "docker-compose") {
    try {
      YAML.parse(content, { strict: true });
    } catch (err: any) {
      errors.push(err.message || "Invalid YAML syntax");
    }
  }

  return errors;
}

function sanitizeOutput(raw: string): string {
  let cleaned = raw;
  cleaned = cleaned.replace(/^[\s\S]*?(?=(?:name:|stages:|version:|pipeline\s*\{|FROM\s|server\s*\{|#\s*---|---\n))/i, "");
  cleaned = cleaned.replace(/^```[a-z]*\n?/i, "");
  cleaned = cleaned.replace(/\n?```\s*$/i, "");
  if (cleaned.trim().length === 0) {
    cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/i, "");
  }
  return cleaned.trim();
}
