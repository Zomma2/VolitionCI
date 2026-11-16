import { NextRequest } from "next/server";
import * as YAML from "js-yaml";
import {
  DEVSECOPS_SYNTHESIS_SYSTEM_PROMPT,
  DEVSECOPS_HEALING_SYSTEM_PROMPT,
} from "@/lib/prompts/devsecopsPrompts";
import {
  TERRAFORM_SYNTHESIS_SYSTEM_PROMPT,
  TERRAFORM_HEALING_SYSTEM_PROMPT,
  KUBERNETES_SYNTHESIS_SYSTEM_PROMPT,
  KUBERNETES_HEALING_SYSTEM_PROMPT,
} from "@/lib/prompts/iacPrompts";
import {
  DOCKER_SYNTHESIS_SYSTEM_PROMPT,
  DOCKER_HEALING_SYSTEM_PROMPT,
} from "@/lib/prompts/dockerPrompts";
import {
  buildModelChain,
  executeModelChain,
  extractFirstJsonObject,
  stripReasoningArtifacts,
} from "@/lib/serverModelRouter";

export const maxDuration = 60;

const MAX_RETRIES = 2;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const {
    repoContext = "",
    userAnswers = {},
    provider = "GitHub Actions",
    archetype = "pipeline",
    selectedModel = "multi-agent",
  } = body;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: string, data: any) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      const emitUsage = (telemetry: any) => {
        sendEvent("usage", {
          model: telemetry.model,
          provider: telemetry.provider,
          role: telemetry.role,
          usage: telemetry.usage,
        });
      };

      try {
        const isModularTarget = archetype === "terraform" || archetype === "kubernetes";
        let finalOutput = "";
        let unresolvedErrors: string[] = [];

        // ── Phase 1: Architecture Blueprint & Module Planner ──
        sendEvent("status", { step: "planning" });

        let modules: string[] = [];
        let blueprintSummary = "";

        try {
          const plannerSystem = isModularTarget
            ? `You are a Principal Cloud & Infrastructure Planner. Break this ${archetype} deployment on ${provider} into exactly 3 non-overlapping, sequential code modules so each module generates distinct resources without duplicating provider blocks or namespaces.
Output strictly valid JSON:
{
  "summary": "Brief architectural plan",
  "modules": ["Module 1 Title", "Module 2 Title", "Module 3 Title"]
}`
            : `You are a Principal DevSecOps & Container Architecture Planner. Design a comprehensive, production-grade ${archetype} specification for ${provider} covering every service, job, security scan, cache, network, volume, and healthcheck required.
Output strictly valid JSON:
{
  "summary": "Concise architectural blueprint",
  "checklist": ["Requirement 1", "Requirement 2", "Requirement 3", "Requirement 4", "Requirement 5"]
}`;

          const plannerUser = `Target Archetype: ${archetype}\nTarget Platform: ${provider}\nRepository/Stack Context:\n${repoContext}\n\nArchitectural Decisions:\n${JSON.stringify(userAnswers, null, 2)}`;

          const { content: planRaw } = await executeModelChain({
            roleLabel: "Phase 1 · Planner",
            systemPrompt: plannerSystem,
            userPrompt: plannerUser,
            maxTokens: 3000,
            temperature: 0.15,
            jsonMode: true,
            minChars: 15,
            chain: buildModelChain(selectedModel, "planner"),
            onUsage: emitUsage,
          });

          const parsedPlan = extractFirstJsonObject(planRaw);
          if (isModularTarget && Array.isArray(parsedPlan?.modules) && parsedPlan.modules.length >= 2) {
            modules = parsedPlan.modules.slice(0, 4).map((m: any) => String(m));
            blueprintSummary = parsedPlan.summary || "";
          } else if (!isModularTarget && parsedPlan) {
            blueprintSummary = JSON.stringify(parsedPlan, null, 2);
          }
        } catch (planErr) {
          console.warn("[Synthesize] Planner fallback activated:", planErr);
        }

        if (isModularTarget && modules.length === 0) {
          modules =
            archetype === "terraform"
              ? [
                  "1. Terraform Backend, Providers & Variables",
                  "2. VPC Networking, Subnets & Security Groups",
                  "3. Compute, Managed Data Stores, IAM & Outputs",
                ]
              : [
                  "1. Namespace, ConfigMap & ServiceAccount",
                  "2. Hardened Workload Deployment & Probes",
                  "3. Service, Ingress TLS, HPA & NetworkPolicy",
                ];
        }

        // ── Phase 2: Multi-Model Code Synthesis & Syntax Gate ──
        if (isModularTarget) {
          const baseSysPrompt =
            archetype === "terraform"
              ? TERRAFORM_SYNTHESIS_SYSTEM_PROMPT
              : KUBERNETES_SYNTHESIS_SYSTEM_PROMPT;
          const healSysPrompt =
            archetype === "terraform"
              ? TERRAFORM_HEALING_SYSTEM_PROMPT
              : KUBERNETES_HEALING_SYSTEM_PROMPT;

          for (let i = 0; i < modules.length; i++) {
            const modName = modules[i];
            sendEvent("status", {
              step: "synthesizing_module",
              module: modName,
              current: i + 1,
              total: modules.length,
            });

            let chunkCode = "";
            let moduleErrors: string[] = [];
            let attempt = 0;
            let moduleValid = false;

            while (attempt <= MAX_RETRIES && !moduleValid) {
              if (attempt > 0) {
                sendEvent("status", {
                  step: "self_healing",
                  attempt,
                  module: modName,
                });
              }

              const workerStage =
                attempt > 0
                  ? "worker-heal"
                  : i % 2 === 0
                    ? "worker-a"
                    : "worker-b";

              const moduleDirective =
                archetype === "terraform"
                  ? i === 0
                    ? `Generate COMPLETE, production-ready Terraform HCL for Module 1: "${modName}" on ${provider}.
Include terraform { required_version ... required_providers ... backend ... }, provider "${provider.toLowerCase().includes("google") ? "google" : provider.toLowerCase().includes("azure") ? "azurerm" : provider.toLowerCase().includes("digital") ? "digitalocean" : "aws"}" configuration, core input variables, and locals.`
                    : `Generate COMPLETE, production-ready Terraform HCL ONLY for Module ${i + 1}: "${modName}" on ${provider}.
CRITICAL: Do NOT redeclare terraform {} or provider {} blocks (they already exist in Module 1). Declare full, richly configured resource/data/output blocks for "${modName}" referencing exact resource names from Previously Generated HCL.`
                  : `Generate COMPLETE, production-ready Kubernetes YAML manifests ONLY for Module ${i + 1}: "${modName}" (${provider}).
Separate multiple Kubernetes resources with --- on its own line. Do NOT repeat resources already declared in Previously Generated YAML. Include complete metadata, labels, securityContext, probes, and resource limits where applicable.`;

              const synthPrompt = `${moduleDirective}
${blueprintSummary ? `\nOverall Plan: ${blueprintSummary}\n` : ""}
Repository / Stack Context:
${repoContext}

Architectural Decisions:
${JSON.stringify(userAnswers, null, 2)}

Previously Generated Code (reference exact IDs/names, do NOT duplicate):
${finalOutput || "None (this is Module 1)"}

Output ONLY raw ${archetype === "terraform" ? "HCL" : "YAML"} code with thorough comments and production settings. Never wrap in markdown backticks.`;

              const healPrompt = `The following ${archetype} module ("${modName}") failed syntax validation.
Validation Errors:
${moduleErrors.join("\n")}

Broken Module Code:
${chunkCode}

Fix ALL syntax/brace/indentation errors while preserving every resource and security setting. Do NOT include duplicate terraform {} or provider {} blocks if this is not Module 1. Output ONLY the corrected raw ${archetype === "terraform" ? "HCL" : "YAML"} module code without markdown fences.`;

              const { content: rawOut } = await executeModelChain({
                roleLabel:
                  attempt === 0
                    ? `Worker ${i + 1}/${modules.length} (${modName})`
                    : `Healer (${modName} #${attempt})`,
                systemPrompt: attempt === 0 ? baseSysPrompt : healSysPrompt,
                userPrompt: attempt === 0 ? synthPrompt : healPrompt,
                maxTokens: 8192,
                temperature: 0.15,
                minChars: 60,
                chain: buildModelChain(selectedModel, workerStage),
                onUsage: emitUsage,
              });

              chunkCode = cleanArtifactCode(rawOut, archetype, provider, i > 0);

              sendEvent("status", { step: "validating" });

              const candidateCombined = joinModularCode(finalOutput, chunkCode, archetype);
              const errs = validateArtifact(candidateCombined, archetype, provider);

              if (errs.length === 0) {
                moduleValid = true;
                moduleErrors = [];
                finalOutput = candidateCombined;
              } else {
                moduleErrors = errs;
                attempt++;
              }
            }

            if (!moduleValid) {
              // Keep valid previous modules if chunk still broken, or append best-effort and record error
              if (chunkCode) {
                finalOutput = joinModularCode(finalOutput, chunkCode, archetype);
              }
              unresolvedErrors = moduleErrors;
            }
          }
        } else {
          // Single-Document Complete Synthesis (CI/CD Pipeline & Docker Compose)
          const targetLabel =
            archetype === "docker" ? "docker-compose.yml" : `${provider} Pipeline`;
          sendEvent("status", {
            step: "synthesizing_module",
            module: targetLabel,
            current: 1,
            total: 1,
          });

          const baseSysPrompt =
            archetype === "docker"
              ? DOCKER_SYNTHESIS_SYSTEM_PROMPT
              : DEVSECOPS_SYNTHESIS_SYSTEM_PROMPT;
          const healSysPrompt =
            archetype === "docker"
              ? DOCKER_HEALING_SYSTEM_PROMPT
              : DEVSECOPS_HEALING_SYSTEM_PROMPT;

          let docCode = "";
          let docErrors: string[] = [];
          let attempt = 0;
          let docValid = false;

          while (attempt <= MAX_RETRIES && !docValid) {
            if (attempt > 0) {
              sendEvent("status", {
                step: "self_healing",
                attempt,
                module: targetLabel,
              });
            }

            const workerStage = attempt === 0 ? "worker-a" : "worker-heal";

            const formatInstruction =
              archetype === "pipeline" && provider === "Jenkins"
                ? "Output a complete, production-hardened Declarative Jenkinsfile (`pipeline { agent ... environment ... options ... stages { ... } post { ... } }`)."
                : archetype === "pipeline"
                  ? `Output a complete, comprehensive, single-document ${provider} YAML configuration (80-160+ lines) including explicit triggers, least-privilege permissions/OIDC, dependency & Docker layer caching, lint/unit test jobs, SAST/secret/container CVE scanning jobs, and progressive deployment.`
                  : `Output a complete, comprehensive, production-grade Compose v2 YAML file (70-150+ lines, starting with 'services:' — omit deprecated top-level 'version:') with full service definitions, healthchecks, depends_on with service_healthy conditions, isolated frontend/backend bridge networks, named persistent volumes, restart policies, and resource limits.`;

            const synthPrompt = `${formatInstruction}

Phase 1 Architectural Blueprint:
${blueprintSummary || "Standard zero-trust production blueprint"}

Repository / Stack Context:
${repoContext}

User Interrogation Decisions:
${JSON.stringify(userAnswers, null, 2)}

CRITICAL: Output ONLY the complete raw configuration file. Do NOT wrap in markdown code fences and do NOT add prose before or after the file.`;

            const healPrompt = `The following ${targetLabel} configuration failed validation:
Validation Errors:
${docErrors.join("\n")}

Broken Configuration:
${docCode}

Fix ALL syntax, duplicate-key, or structural errors while keeping the full set of jobs/services, security scans, caching, networks, and healthchecks intact. Output ONLY the complete corrected raw configuration file without markdown code fences.`;

            const { content: rawOut } = await executeModelChain({
              roleLabel:
                attempt === 0
                  ? `Phase 2 · Code Synthesizer (${targetLabel})`
                  : `Phase 2 · Syntax Healer (#${attempt})`,
              systemPrompt: attempt === 0 ? baseSysPrompt : healSysPrompt,
              userPrompt: attempt === 0 ? synthPrompt : healPrompt,
              maxTokens: 8192,
              temperature: 0.15,
              minChars: 120,
              chain: buildModelChain(selectedModel, workerStage),
              onUsage: emitUsage,
            });

            docCode = cleanArtifactCode(rawOut, archetype, provider, false);

            sendEvent("status", { step: "validating" });

            const errs = validateArtifact(docCode, archetype, provider);
            if (errs.length === 0) {
              docValid = true;
              docErrors = [];
              unresolvedErrors = [];
            } else {
              docErrors = errs;
              attempt++;
            }
          }

          finalOutput = docCode;
          if (!docValid) {
            unresolvedErrors = docErrors;
          }
        }

        // ── Phase 3: Multi-Model Semantic Completeness Verification & Auto-Enrichment ──
        if (unresolvedErrors.length === 0 && finalOutput.trim().length > 0) {
          sendEvent("status", { step: "semantic_validation" });

          try {
            const valSystem = `You are a Principal Infrastructure Semantic Reviewer. Verify whether the synthesized ${archetype} configuration for ${provider} implements the core components requested in the context and user answers.
Respond strictly in JSON:
{
  "status": "VALID" | "MISSING",
  "missing": ["concise missing item if truly absent, otherwise empty array"]
}
Mark "VALID" if all major requested services/stages are present, even if minor optional flags vary.`;

            const valUser = `Context:\n${repoContext}\n\nUser Answers:\n${JSON.stringify(userAnswers, null, 2)}\n\nGenerated ${archetype} Code:\n${finalOutput}`;

            const { content: valRaw } = await executeModelChain({
              roleLabel: "Phase 3 · Semantic Verifier",
              systemPrompt: valSystem,
              userPrompt: valUser,
              maxTokens: 3000,
              temperature: 0.1,
              jsonMode: true,
              minChars: 10,
              chain: buildModelChain(selectedModel, "validator"),
              onUsage: emitUsage,
            });

            const verdict = extractFirstJsonObject(valRaw);
            if (
              verdict?.status === "MISSING" &&
              Array.isArray(verdict.missing) &&
              verdict.missing.length > 0
            ) {
              // Auto-enrich missing components and re-validate syntax!
              sendEvent("status", {
                step: "self_healing",
                attempt: 1,
                module: "Semantic Completeness",
              });

              const enrichPrompt = `Enhance and complete the following ${archetype} configuration (${provider}) by adding these missing requested components:
${verdict.missing.map((m: string) => `- ${m}`).join("\n")}

Existing Valid Code:
${finalOutput}

Return the COMPLETE, unified, syntax-valid ${archetype} configuration containing all existing code plus the missing components integrated cleanly. Output raw code only, no markdown fences.`;

              const { content: enrichedRaw } = await executeModelChain({
                roleLabel: "Phase 3 · Completeness Enricher",
                systemPrompt:
                  archetype === "terraform"
                    ? TERRAFORM_SYNTHESIS_SYSTEM_PROMPT
                    : archetype === "kubernetes"
                      ? KUBERNETES_SYNTHESIS_SYSTEM_PROMPT
                      : archetype === "docker"
                        ? DOCKER_SYNTHESIS_SYSTEM_PROMPT
                        : DEVSECOPS_SYNTHESIS_SYSTEM_PROMPT,
                userPrompt: enrichPrompt,
                maxTokens: 8192,
                temperature: 0.15,
                minChars: finalOutput.length * 0.6,
                chain: buildModelChain(selectedModel, "worker-b"),
                onUsage: emitUsage,
              });

              const enrichedClean = cleanArtifactCode(enrichedRaw, archetype, provider, false);
              const enrichErrs = validateArtifact(enrichedClean, archetype, provider);
              if (enrichErrs.length === 0) {
                finalOutput = enrichedClean;
              }
            }
          } catch (valErr) {
            console.warn("[Synthesize] Semantic validator non-blocking error:", valErr);
          }
        }

        sendEvent("complete", {
          code: finalOutput,
          warning:
            unresolvedErrors.length > 0
              ? `Syntax notice: ${unresolvedErrors[0]}`
              : undefined,
        });
      } catch (err: any) {
        console.error("[/api/synthesize] Error:", err);
        sendEvent("error", {
          message: err.message || "Failed to synthesize configuration",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function cleanArtifactCode(
  raw: string,
  archetype: string,
  provider: string,
  stripDuplicateTerraformHeader: boolean
): string {
  let text = stripReasoningArtifacts(raw);

  // Extract fenced block if the model wrapped the code in ```...```
  const fenceMatch = text.match(/```(?:[a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1] && fenceMatch[1].trim().length > 30) {
    text = fenceMatch[1];
  } else {
    text = text.replace(/^```[a-zA-Z0-9_-]*\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  }

  // Strip leading conversational prose lines safely (never touching YAML/HCL/Groovy lines)
  const lines = text.split("\n");
  while (lines.length > 0) {
    const trimmed = lines[0].trim();
    if (!trimmed) {
      lines.shift();
      continue;
    }
    const looksLikeProse =
      /^(?:here\s+is|below\s+is|certainly|sure[,!]|i\s+have\s+generated|this\s+configuration)/i.test(
        trimmed
      ) && !trimmed.startsWith("#") && !trimmed.startsWith("//");
    if (looksLikeProse) {
      lines.shift();
    } else {
      break;
    }
  }

  let cleaned = lines.join("\n").trim();

  // If Terraform Module 2+ accidentally emitted terraform {} or provider {} blocks, strip them cleanly
  if (archetype === "terraform" && stripDuplicateTerraformHeader) {
    cleaned = stripTopLevelHclBlocks(cleaned, ["terraform", "provider"]);
  }

  return cleaned.trim();
}

function stripTopLevelHclBlocks(hcl: string, blockTypes: string[]): string {
  let result = hcl;
  for (const bType of blockTypes) {
    const regex = new RegExp(`(^|\\n)\\s*${bType}(?:\\s+"[^"]*")*\\s*\\{`, "g");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(result)) !== null) {
      const startIdx = match.index + (match[1] ? match[1].length : 0);
      const braceStart = result.indexOf("{", startIdx);
      if (braceStart === -1) break;
      let depth = 0;
      let inStr = false;
      let esc = false;
      let endIdx = -1;
      for (let i = braceStart; i < result.length; i++) {
        const ch = result[i];
        if (esc) {
          esc = false;
          continue;
        }
        if (ch === "\\") {
          esc = true;
          continue;
        }
        if (ch === '"') {
          inStr = !inStr;
          continue;
        }
        if (!inStr) {
          if (ch === "{") depth++;
          else if (ch === "}") {
            depth--;
            if (depth === 0) {
              endIdx = i;
              break;
            }
          }
        }
      }
      if (endIdx !== -1) {
        result = (result.slice(0, startIdx) + "\n" + result.slice(endIdx + 1)).trim();
        regex.lastIndex = 0;
      } else {
        break;
      }
    }
  }
  return result.trim();
}

function joinModularCode(existing: string, nextChunk: string, archetype: string): string {
  const trimmedNext = nextChunk.trim();
  if (!existing.trim()) return trimmedNext;
  if (!trimmedNext) return existing.trim();

  if (archetype === "kubernetes") {
    const cleanExisting = existing.trim().replace(/\n---\s*$/, "");
    const cleanNext = trimmedNext.replace(/^---\s*\n/, "");
    return `${cleanExisting}\n---\n${cleanNext}`;
  }

  return `${existing.trim()}\n\n${trimmedNext}`;
}

function validateArtifact(content: string, archetype: string, provider: string): string[] {
  if (!content || content.trim().length < 30) {
    return ["Generated configuration is empty or truncated."];
  }

  if (archetype === "terraform") {
    return validateHclOutput(content);
  }

  if (archetype === "pipeline" && provider === "Jenkins") {
    return validateJenkinsfile(content);
  }

  const errors: string[] = [];
  try {
    const docs = YAML.loadAll(content).filter((d) => d !== null && d !== undefined);
    if (docs.length === 0) {
      errors.push("YAML file contains no valid configuration documents.");
      return errors;
    }
    for (const doc of docs) {
      if (typeof doc !== "object" || Array.isArray(doc)) {
        errors.push("Root YAML document must be a key-value mapping object.");
        break;
      }
    }
    if (archetype === "docker") {
      const root = docs[0] as Record<string, any>;
      if (!root?.services || typeof root.services !== "object") {
        errors.push("Docker Compose YAML must define a top-level 'services:' mapping.");
      }
    } else if (archetype === "kubernetes") {
      for (const doc of docs as Record<string, any>[]) {
        if (!doc.apiVersion || !doc.kind) {
          errors.push("Every Kubernetes YAML document must include 'apiVersion' and 'kind'.");
          break;
        }
      }
    }
  } catch (err: any) {
    errors.push(err.message || "Invalid YAML syntax");
  }
  return errors;
}

function validateJenkinsfile(content: string): string[] {
  const errors: string[] = [];
  if (!/\bpipeline\s*\{/.test(content) || !/\bstages\s*\{/.test(content)) {
    errors.push("Declarative Jenkinsfile must contain 'pipeline { ... stages { ... } }' blocks.");
  }
  let braces = 0;
  let inSingle = false;
  let inDouble = false;
  let esc = false;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (c === "\\") {
      esc = true;
      continue;
    }
    if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (c === "{") braces++;
      else if (c === "}") braces--;
    }
  }
  if (braces !== 0) {
    errors.push(`Unbalanced braces in Jenkinsfile (difference: ${braces}).`);
  }
  return errors;
}

function validateHclOutput(content: string): string[] {
  const errors: string[] = [];
  let openBraces = 0;
  let inString = false;
  let inHeredoc = false;
  let heredocMarker = "";
  let escapeNext = false;

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (inHeredoc) {
      if (trimmed === heredocMarker) {
        inHeredoc = false;
        heredocMarker = "";
      }
      continue;
    }

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === "\\") {
        escapeNext = true;
        continue;
      }
      if (!inString) {
        if (char === "#" || (char === "/" && line[i + 1] === "/")) {
          break; // rest of line is comment
        }
        if (char === "<" && line[i + 1] === "<") {
          const hdMatch = line.slice(i).match(/^<<-?([A-Za-z0-9_]+)/);
          if (hdMatch) {
            inHeredoc = true;
            heredocMarker = hdMatch[1];
            break;
          }
        }
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === "{") openBraces++;
        if (char === "}") openBraces--;
      }
    }
  }

  if (openBraces !== 0) {
    errors.push(`Unbalanced braces in HCL syntax (unclosed count: ${openBraces})`);
  }

  const hasHclBlock = /(?:terraform|provider|resource|variable|output|locals|module|data)\s+[{"\w]/.test(
    content
  );
  if (!hasHclBlock) {
    errors.push(
      "Missing recognizable Terraform root blocks (terraform, provider, resource, or module)."
    );
  }

  return errors;
}
