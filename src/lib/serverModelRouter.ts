import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { ModelSelectionId } from "./aiModels";

export type ProviderName = "gemini" | "mistral" | "cohere" | "groq";

export interface RuntimeModelSpec {
  provider: ProviderName;
  model: string;
  label: string;
}

export const MODEL_SPECS: Record<Exclude<ModelSelectionId, "multi-agent"> | "command-r-plus", RuntimeModelSpec> = {
  "gemini-3.6-flash": {
    provider: "gemini",
    model: "models/gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
  },
  "codestral-latest": {
    provider: "mistral",
    model: "codestral-latest",
    label: "Mistral Codestral",
  },
  "gpt-oss-120b": {
    provider: "groq",
    model: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
  },
  "command-a": {
    provider: "cohere",
    model: "command-a-03-2025",
    label: "Cohere Command A",
  },
  "qwen-3.8-27b": {
    provider: "groq",
    model: "qwen/qwen3.8-27b",
    label: "Qwen 3.8 27B",
  },
  "command-r-plus": {
    provider: "cohere",
    model: "command-r-plus-08-2024",
    label: "Cohere Command R+",
  },
};

export type StageChainRole =
  | "chat"
  | "analyze"
  | "planner"
  | "worker-a"
  | "worker-b"
  | "worker-heal"
  | "validator";

function dedupeSpecs(specs: RuntimeModelSpec[]): RuntimeModelSpec[] {
  const seen = new Set<string>();
  const out: RuntimeModelSpec[] = [];
  for (const s of specs) {
    const key = `${s.provider}:${s.model}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

export function buildModelChain(
  selectedModel: string | undefined,
  stage: StageChainRole
): RuntimeModelSpec[] {
  const ensembleChains: Record<StageChainRole, RuntimeModelSpec[]> = {
    chat: [
      MODEL_SPECS["gemini-3.6-flash"],
      MODEL_SPECS["gpt-oss-120b"],
      MODEL_SPECS["command-a"],
      MODEL_SPECS["qwen-3.8-27b"],
    ],
    analyze: [
      MODEL_SPECS["qwen-3.8-27b"],
      MODEL_SPECS["gemini-3.6-flash"],
      MODEL_SPECS["command-a"],
      MODEL_SPECS["gpt-oss-120b"],
    ],
    planner: [
      MODEL_SPECS["command-a"],
      MODEL_SPECS["gemini-3.6-flash"],
      MODEL_SPECS["qwen-3.8-27b"],
      MODEL_SPECS["command-r-plus"],
    ],
    "worker-a": [
      MODEL_SPECS["codestral-latest"],
      MODEL_SPECS["gemini-3.6-flash"],
      MODEL_SPECS["gpt-oss-120b"],
      MODEL_SPECS["command-a"],
    ],
    "worker-b": [
      MODEL_SPECS["gemini-3.6-flash"],
      MODEL_SPECS["codestral-latest"],
      MODEL_SPECS["gpt-oss-120b"],
      MODEL_SPECS["command-a"],
    ],
    "worker-heal": [
      MODEL_SPECS["gpt-oss-120b"],
      MODEL_SPECS["codestral-latest"],
      MODEL_SPECS["gemini-3.6-flash"],
      MODEL_SPECS["command-a"],
    ],
    validator: [
      MODEL_SPECS["gpt-oss-120b"],
      MODEL_SPECS["gemini-3.6-flash"],
      MODEL_SPECS["codestral-latest"],
      MODEL_SPECS["qwen-3.8-27b"],
    ],
  };

  if (
    !selectedModel ||
    selectedModel === "multi-agent" ||
    !(selectedModel in MODEL_SPECS)
  ) {
    return ensembleChains[stage];
  }

  const chosen = MODEL_SPECS[selectedModel as keyof typeof MODEL_SPECS];

  // For healing passes, place a distinct complementary model right behind or alongside if needed,
  // while always honoring the user's selected primary model first on primary passes.
  return dedupeSpecs([chosen, ...ensembleChains[stage]]);
}

export function stripReasoningArtifacts(raw: string): string {
  return (raw || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();
}

export function extractFirstJsonObject(raw: string): any {
  const cleaned = stripReasoningArtifacts(raw)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to balanced-brace extraction
  }

  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < cleaned.length; i++) {
    const c = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (c === "{") {
        depth++;
      } else if (c === "}") {
        depth--;
        if (depth === 0) {
          const candidate = cleaned.substring(start, i + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
}

export interface ModelCallOptions {
  roleLabel: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  minChars?: number;
  chain: RuntimeModelSpec[];
  onUsage?: (telemetry: {
    model: string;
    provider: ProviderName;
    role: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
      total_time: number;
    };
  }) => void;
}

export async function executeModelChain(opts: ModelCallOptions): Promise<{
  content: string;
  usedSpec: RuntimeModelSpec;
}> {
  const {
    roleLabel,
    systemPrompt,
    userPrompt,
    maxTokens = 8192,
    temperature = 0.15,
    jsonMode = false,
    minChars = 5,
    chain,
    onUsage,
  } = opts;

  let lastError: any = null;

  for (let i = 0; i < chain.length; i++) {
    const spec = chain[i];
    const attemptRole = i === 0 ? roleLabel : `${roleLabel} [Fallback ${i}]`;

    try {
      const startTime = Date.now();
      let content = "";
      let usage = {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        total_time: 0,
      };

      if (spec.provider === "gemini") {
        if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: spec.model,
          systemInstruction: systemPrompt,
        });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: Math.max(maxTokens, 4096),
            temperature,
            ...(jsonMode ? { responseMimeType: "application/json" } : {}),
          },
        });
        content = stripReasoningArtifacts(result.response.text());
        const u = result.response.usageMetadata;
        usage.prompt_tokens = u?.promptTokenCount || 0;
        usage.completion_tokens = u?.candidatesTokenCount || 0;
        usage.total_tokens = u?.totalTokenCount || usage.prompt_tokens + usage.completion_tokens;
      } else if (spec.provider === "mistral") {
        if (!process.env.MISTRAL_API_KEY) throw new Error("Missing MISTRAL_API_KEY");
        const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: spec.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature,
            max_tokens: Math.min(maxTokens, 8192),
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          }),
        });
        if (!res.ok) {
          throw new Error(`Mistral HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
        }
        const data = await res.json();
        content = stripReasoningArtifacts(data.choices?.[0]?.message?.content || "");
        usage.prompt_tokens = data.usage?.prompt_tokens || 0;
        usage.completion_tokens = data.usage?.completion_tokens || 0;
        usage.total_tokens = data.usage?.total_tokens || usage.prompt_tokens + usage.completion_tokens;
      } else if (spec.provider === "cohere") {
        if (!process.env.COHERE_API_KEY) throw new Error("Missing COHERE_API_KEY");
        const res = await fetch("https://api.cohere.com/v2/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          },
          body: JSON.stringify({
            model: spec.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature,
            max_tokens: Math.min(maxTokens, 4000),
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          }),
        });
        if (!res.ok) {
          throw new Error(`Cohere HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
        }
        const data = await res.json();
        content = stripReasoningArtifacts(data.message?.content?.[0]?.text || "");
        usage.prompt_tokens = data.usage?.tokens?.input_tokens || 0;
        usage.completion_tokens = data.usage?.tokens?.output_tokens || 0;
        usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;
      } else if (spec.provider === "groq") {
        if (!process.env.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          model: spec.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature,
          max_tokens: Math.min(Math.max(maxTokens, 4096), 8192),
          ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        });
        content = stripReasoningArtifacts(completion.choices?.[0]?.message?.content || "");
        const u: any = completion.usage || {};
        usage.prompt_tokens = u.prompt_tokens || 0;
        usage.completion_tokens = u.completion_tokens || 0;
        usage.total_tokens = u.total_tokens || usage.prompt_tokens + usage.completion_tokens;
      }

      if (content.length < minChars) {
        throw new Error(
          `Model ${spec.model} returned insufficient output (${content.length} chars < ${minChars})`
        );
      }

      if (jsonMode && !extractFirstJsonObject(content)) {
        throw new Error(`Model ${spec.model} did not return parseable JSON`);
      }

      usage.total_time = Number(((Date.now() - startTime) / 1000).toFixed(2));

      if (onUsage) {
        onUsage({
          model: spec.label,
          provider: spec.provider,
          role: attemptRole,
          usage,
        });
      }

      return { content, usedSpec: spec };
    } catch (err: any) {
      console.warn(`[ModelRouter] ${spec.provider}:${spec.model} failed for ${roleLabel}:`, err?.message);
      lastError = err;
    }
  }

  throw new Error(
    `All models in chain failed for ${roleLabel}. Last error: ${lastError?.message || "Unknown"}`
  );
}
