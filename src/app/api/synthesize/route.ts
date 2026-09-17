import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import * as YAML from "js-yaml";
import { 
  DEVSECOPS_SYNTHESIS_SYSTEM_PROMPT, 
  DEVSECOPS_SYNTHESIS_USER_PROMPT,
  DEVSECOPS_HEALING_SYSTEM_PROMPT,
  DEVSECOPS_HEALING_USER_PROMPT
} from "@/lib/prompts/devsecopsPrompts";
import {
  TERRAFORM_SYNTHESIS_SYSTEM_PROMPT,
  TERRAFORM_SYNTHESIS_USER_PROMPT,
  TERRAFORM_HEALING_SYSTEM_PROMPT,
  TERRAFORM_HEALING_USER_PROMPT,
  KUBERNETES_SYNTHESIS_SYSTEM_PROMPT,
  KUBERNETES_SYNTHESIS_USER_PROMPT,
  KUBERNETES_HEALING_SYSTEM_PROMPT,
  KUBERNETES_HEALING_USER_PROMPT,
} from "@/lib/prompts/iacPrompts";
import {
  DOCKER_SYNTHESIS_SYSTEM_PROMPT,
  DOCKER_SYNTHESIS_USER_PROMPT,
  DOCKER_HEALING_SYSTEM_PROMPT,
  DOCKER_HEALING_USER_PROMPT,
} from "@/lib/prompts/dockerPrompts";

import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type ModelConfig = {
  provider: "gemini" | "mistral" | "cohere" | "groq";
  model: string;
};

const PLANNER_CHAIN: ModelConfig[] = [
  { provider: "gemini", model: "models/antigravity-preview-09-2026" },
  { provider: "cohere", model: "command-r-plus-08-2024" },
  { provider: "groq", model: "openai/gpt-oss-20b" }
];

const WORKER_CHAIN: ModelConfig[] = [
  { provider: "gemini", model: "models/deep-research-max-preview-04-2026" },
  { provider: "mistral", model: "codestral-latest" },
  { provider: "groq", model: "openai/gpt-oss-120b" }
];

const VALIDATOR_CHAIN: ModelConfig[] = [
  { provider: "gemini", model: "models/antigravity-preview-09-2026" },
  { provider: "mistral", model: "codestral-latest" },
  { provider: "groq", model: "openai/gpt-oss-20b" }
];

const MAX_RETRIES = 3;

async function runModelChain(
  role: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  chain: ModelConfig[],
  sendEvent: Function
) {
  let lastError;
  for (let i = 0; i < chain.length; i++) {
    const config = chain[i];
    const isPrimary = i === 0;
    const attemptRole = role + (isPrimary ? " (Primary)" : ` (Fallback ${i})`);
    
    try {
      const startTime = Date.now();
      let content = "";
      let usage: any = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, total_time: 0 };
      
      if (config.provider === "gemini") {
        const model = genAI.getGenerativeModel({ 
          model: config.model,
          systemInstruction: systemPrompt 
        });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: maxTokens, temperature: 0.15 }
        });
        content = result.response.text();
        const u = result.response.usageMetadata;
        usage.prompt_tokens = u?.promptTokenCount || 0;
        usage.completion_tokens = u?.candidatesTokenCount || 0;
        usage.total_tokens = u?.totalTokenCount || 0;
      } else if (config.provider === "mistral") {
        const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.15,
            max_tokens: maxTokens
          })
        });
        if (!res.ok) throw new Error(`Mistral API Error: ${await res.text()}`);
        const data = await res.json();
        content = data.choices[0]?.message?.content || "";
        usage = data.usage || usage;
      } else if (config.provider === "cohere") {
        const res = await fetch("https://api.cohere.com/v2/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.COHERE_API_KEY}`
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.15,
            max_tokens: maxTokens
          })
        });
        if (!res.ok) throw new Error(`Cohere API Error: ${await res.text()}`);
        const data = await res.json();
        content = data.message?.content?.[0]?.text || "";
        usage.prompt_tokens = data.usage?.tokens?.input_tokens || 0;
        usage.completion_tokens = data.usage?.tokens?.output_tokens || 0;
        usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;
      } else if (config.provider === "groq") {
        const completion = await groq.chat.completions.create({
          model: config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.15,
          max_tokens: maxTokens
        });
        content = completion.choices[0]?.message?.content || "";
        usage = completion.usage as any || usage;
      }
      
      usage.total_time = (Date.now() - startTime) / 1000;
      
      sendEvent("usage", {
        model: config.model.replace("models/", ""),
        role: attemptRole,
        usage: usage
      });
      
      return content;
    } catch (err: any) {
      console.error(`${config.provider} failed for ${role}:`, err?.message || err);
      lastError = err;
      // continue loop to next fallback
    }
  }
  
  throw new Error(`All models in chain failed for ${role}. Last error: ${lastError?.message}`);
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { repoContext, userAnswers, provider, archetype = "pipeline" } = body;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: string, data: any) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        let currentOutput = "";
        let attempt = 0;
        let isValid = false;

        let initialSystemPrompt = DEVSECOPS_SYNTHESIS_SYSTEM_PROMPT;
        let initialUserPrompt = DEVSECOPS_SYNTHESIS_USER_PROMPT(provider, repoContext, userAnswers);
        let healingSystemPrompt = DEVSECOPS_HEALING_SYSTEM_PROMPT;
        let healingUserPromptFn = DEVSECOPS_HEALING_USER_PROMPT;

        if (archetype === "terraform") {
          initialSystemPrompt = TERRAFORM_SYNTHESIS_SYSTEM_PROMPT;
          initialUserPrompt = TERRAFORM_SYNTHESIS_USER_PROMPT(provider || "AWS", repoContext, userAnswers);
          healingSystemPrompt = TERRAFORM_HEALING_SYSTEM_PROMPT;
          healingUserPromptFn = TERRAFORM_HEALING_USER_PROMPT;
        } else if (archetype === "kubernetes") {
          initialSystemPrompt = KUBERNETES_SYNTHESIS_SYSTEM_PROMPT;
          initialUserPrompt = KUBERNETES_SYNTHESIS_USER_PROMPT(provider || "Generic Kubernetes", repoContext, userAnswers);
          healingSystemPrompt = KUBERNETES_HEALING_SYSTEM_PROMPT;
          healingUserPromptFn = KUBERNETES_HEALING_USER_PROMPT;
        } else if (archetype === "docker") {
          initialSystemPrompt = DOCKER_SYNTHESIS_SYSTEM_PROMPT;
          initialUserPrompt = DOCKER_SYNTHESIS_USER_PROMPT(repoContext, provider || "Local Development", userAnswers);
          healingSystemPrompt = DOCKER_HEALING_SYSTEM_PROMPT;
          healingUserPromptFn = DOCKER_HEALING_USER_PROMPT;
        }

        let finalOutput = "";
        let finalErrors: string[] = [];
        let plan: string[] = ["Complete Architecture"];

        // ── Phase 1: Planning (Modular Breakdown) ──
        sendEvent("status", { step: "planning" });
        try {
          const systemPrompt = `You are an Infrastructure Planner. The user wants to deploy a ${archetype} architecture. Break the deployment down into 2 to 5 logical code modules (e.g., ["Provider Settings", "Networking", "Compute", "Database"]). Output strictly a JSON object with the format: {"plan": ["module1", "module2", ...]}. Do NOT use markdown formatting (\`\`\`json). Do NOT add any explanations.`;
          const userPrompt = `Context: ${repoContext}\nProvider: ${provider}\nAnswers: ${JSON.stringify(userAnswers)}`;

          const rawContent = await runModelChain(
            "Planner",
            systemPrompt,
            userPrompt,
            400,
            PLANNER_CHAIN,
            sendEvent
          );

          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
          
          if (parsed.plan && Array.isArray(parsed.plan)) {
            plan = parsed.plan;
          }
        } catch (e) {
          console.error("Planner failed, falling back to monolithic", e);
        }

        // ── Phase 2: Worker Loop (Iterative Synthesis) ──
        for (let i = 0; i < plan.length; i++) {
          const chunkName = plan[i];
          sendEvent("status", { step: "synthesizing_module", module: chunkName, current: i + 1, total: plan.length });

          let chunkOutput = "";
          let chunkAttempt = 0;
          let chunkValid = false;

          while (chunkAttempt <= MAX_RETRIES && !chunkValid) {
            if (chunkAttempt > 0) {
              sendEvent("status", { step: "self_healing", attempt: chunkAttempt, module: chunkName });
            }

            const isMonolithicFallback = plan.length === 1 && chunkName === "Complete Architecture";
            
            const basePrompt = isMonolithicFallback 
              ? initialUserPrompt 
              : `Generate ONLY the specific code for this module: "${chunkName}". Do NOT generate the entire architecture. Do NOT use markdown fences. Output raw code.\n\nContext: ${repoContext}\nAnswers: ${JSON.stringify(userAnswers)}\n\nPreviously Generated Code (Reference IDs/variables from here):\n${finalOutput || "None"}`;

            const sysPrompt = chunkAttempt === 0 ? initialSystemPrompt : healingSystemPrompt;
            const usrPrompt = chunkAttempt === 0 ? basePrompt : healingUserPromptFn(chunkOutput, finalErrors);

            const rawContent = await runModelChain(
              `Worker (${chunkName})`,
              sysPrompt,
              usrPrompt,
              1000,
              WORKER_CHAIN,
              sendEvent
            );

            chunkOutput = sanitizeOutput(rawContent, archetype);

            sendEvent("status", { step: "validating" });
            
            // Validate the concatenated result so far
            const testCode = finalOutput + "\n" + chunkOutput;
            const errors = archetype === "terraform"
              ? validateHclOutput(testCode)
              : validateYamlOutput(testCode);

            if (errors.length === 0) {
              chunkValid = true;
            } else {
              // HCL allows partial code to pass syntax checks sometimes, but if it fundamentally breaks the file, we retry.
              // If it's a structural error (like unclosed braces), the regex catches it.
              finalErrors = errors;
              chunkAttempt++;
            }
          }
          finalOutput += (finalOutput ? "\n" : "") + chunkOutput;
        }

        currentOutput = finalOutput;
        isValid = finalErrors.length === 0;

        // ── Phase 3: Semantic Validation ──
        if (isValid) {
          sendEvent("status", { step: "semantic_validation" });
          const sysPrompt = "You are an elite Semantic Validator. Ensure the generated code explicitly declares resources for ALL components requested by the user. If any requested module/service is missing, respond exactly with 'MISSING: <details>'. If all requested components exist, respond exactly with 'VALID'. Do not explain.";
          const usrPrompt = `Requested Context:\n${repoContext}\n\nUser Answers:\n${JSON.stringify(userAnswers, null, 2)}\n\nGenerated Code:\n${currentOutput}`;

          const rawContent = await runModelChain(
            "Semantic Validator",
            sysPrompt,
            usrPrompt,
            300,
            VALIDATOR_CHAIN,
            sendEvent
          );

          const valResult = rawContent.trim();
          if (!valResult.startsWith("VALID")) {
            finalErrors.push(`Semantic Validation Failed: ${valResult}`);
            isValid = false;
          }
        }

        sendEvent("complete", { code: currentOutput, warning: !isValid ? "Could not fully resolve all errors." : undefined });

      } catch (err: any) {
        console.error("[/api/synthesize] Error:", err);
        sendEvent("error", { message: err.message || "Failed to synthesize configuration" });
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

function validateYamlOutput(content: string): string[] {
  const errors: string[] = [];
  try {
    YAML.loadAll(content); // Multi-document safe parsing for K8s manifests & single-doc pipelines
  } catch (err: any) {
    errors.push(err.message || "Invalid YAML syntax");
  }
  return errors;
}

function validateHclOutput(content: string): string[] {
  const errors: string[] = [];
  if (!content || content.trim().length === 0) {
    errors.push("Generated Terraform code is empty.");
    return errors;
  }

  // Structural bracket balance check
  let openBraces = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
    }
  }

  if (openBraces !== 0) {
    errors.push(`Unbalanced braces in HCL syntax (unclosed count: ${openBraces})`);
  }

  // Check presence of top-level HCL blocks
  const hasHclBlock = /(?:terraform|provider|resource|variable|output|locals|module|data)\s+[{"\w]/.test(content);
  if (!hasHclBlock) {
    errors.push("Missing recognizable Terraform root blocks (terraform, provider, resource, or module).");
  }

  return errors;
}

function sanitizeOutput(raw: string, archetype: string): string {
  let cleaned = raw;

  if (archetype === "terraform") {
    cleaned = cleaned.replace(/^[\s\S]*?(?=(?:terraform\s*\{|provider\s+|resource\s+|variable\s+|locals\s*\{|module\s+|data\s+|#))/i, "");
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "");
    cleaned = cleaned.replace(/\n?```\s*$/i, "");
  } else {
    cleaned = cleaned.replace(/^[\s\S]*?(?=(?:apiVersion:|kind:|name:|stages:|version:|pipeline\s*\{|FROM\s|server\s*\{|#\s*---|---\n))/i, "");
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "");
    cleaned = cleaned.replace(/\n?```\s*$/i, "");
  }

  if (cleaned.trim().length === 0) {
    cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/i, "");
  }
  return cleaned.trim();
}
