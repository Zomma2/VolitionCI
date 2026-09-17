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

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// Limit max_tokens to 1000 to respect free-tier OTPM limits on qwen and gpt-oss-120b
const MODEL = "openai/gpt-oss-120b";
const VALIDATOR_MODEL = "llama-3.1-8b-instant";
const MAX_RETRIES = 3;

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

        let currentMessages: any[] = [
          { role: "system", content: initialSystemPrompt },
          { role: "user", content: initialUserPrompt },
        ];

        sendEvent("status", { step: "synthesizing" });

        while (attempt <= MAX_RETRIES && !isValid) {
          if (attempt > 0) {
            sendEvent("status", { step: "self_healing", attempt });
          }

          const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: currentMessages,
            temperature: 0.15,
            max_tokens: 1000, 
          });

          sendEvent("usage", {
            model: MODEL,
            role: "Generator",
            usage: completion.usage,
          });

          currentOutput = sanitizeOutput(completion.choices[0]?.message?.content ?? "", archetype);

          sendEvent("status", { step: "validating" });
          const errors = archetype === "terraform"
            ? validateHclOutput(currentOutput)
            : validateYamlOutput(currentOutput);

          // Semantic LLM Validation if schema passed
          if (errors.length === 0) {
            sendEvent("status", { step: "semantic_validation" });
            const validatorCompletion = await groq.chat.completions.create({
              model: VALIDATOR_MODEL,
              messages: [
                {
                  role: "system",
                  content: "You are an elite Semantic Validator. Ensure the generated code explicitly declares resources for ALL components requested by the user. If any requested module/service is missing from the code, respond exactly with 'MISSING: <details>'. If all requested components exist, respond exactly with 'VALID'. Do not explain."
                },
                {
                  role: "user",
                  content: `Requested Context:\n${repoContext}\n\nUser Answers:\n${JSON.stringify(userAnswers, null, 2)}\n\nGenerated Code:\n${currentOutput}`
                }
              ],
              temperature: 0.1,
              max_tokens: 300,
            });

            sendEvent("usage", {
              model: VALIDATOR_MODEL,
              role: "Semantic Validator",
              usage: validatorCompletion.usage,
            });

            const valResult = (validatorCompletion.choices[0]?.message?.content || "").trim();
            if (!valResult.startsWith("VALID")) {
              errors.push(`Semantic Validation Failed: ${valResult}`);
            }
          }

          if (errors.length === 0) {
            isValid = true;
          } else {
            attempt++;
            if (attempt <= MAX_RETRIES) {
              currentMessages = [
                { role: "system", content: healingSystemPrompt },
                { role: "user", content: healingUserPromptFn(currentOutput, errors) },
              ];
            }
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
