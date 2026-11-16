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
      let streamClosed = false;
      function sendEvent(event: string, data: any) {
        if (streamClosed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          streamClosed = true;
        }
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
        let namingContract = "";
        let blueprintSummary = "";

        try {
          const plannerSystem = isModularTarget
            ? `You are a Principal Cloud & Infrastructure Planner. Break this ${archetype} deployment on ${provider} into exactly 2 non-overlapping modules that can be synthesized cleanly and combined:
- Module 1: Core foundation (for Terraform: terraform/provider blocks, variables, VPC/networking, security groups; for Kubernetes: Namespace, ConfigMap, Secrets, ServiceAccount, RBAC).
- Module 2: Workloads, data & routing (for Terraform: compute/clusters, managed databases, storage, IAM roles, outputs; for Kubernetes: Deployment with probes/securityContext, Service, Ingress TLS, HPA, NetworkPolicy).
Also define a short "namingContract" of shared identifiers (e.g., aws_vpc.main.id, aws_subnet.private[*].id, or namespace: app-prod, app: web-api) so both modules reference identical resource names.
Output strictly valid JSON:
{
  "summary": "Brief architectural plan",
  "namingContract": "Exact resource IDs/names shared between Module 1 and Module 2",
  "modules": ["Module 1 Title", "Module 2 Title"]
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
            maxTokens: 2000,
            temperature: 0.15,
            jsonMode: true,
            minChars: 15,
            chain: buildModelChain(selectedModel, "planner"),
            onUsage: emitUsage,
          });

          const parsedPlan = extractFirstJsonObject(planRaw);
          if (isModularTarget && Array.isArray(parsedPlan?.modules) && parsedPlan.modules.length >= 2) {
            modules = parsedPlan.modules.slice(0, 2).map((m: any) => String(m));
            namingContract = parsedPlan.namingContract || "";
            blueprintSummary = parsedPlan.summary || "";
          } else if (!isModularTarget && parsedPlan) {
            blueprintSummary = JSON.stringify(parsedPlan, null, 2);
          }
        } catch (planErr) {
          console.warn("[Synthesize] Planner fallback activated:", planErr);
        }

        if (isModularTarget && modules.length === 0) {
          if (archetype === "terraform") {
            modules = [
              "1. Provider Settings, Variables, VPC & Networking",
              "2. Compute, Managed Databases, Storage, IAM & Outputs",
            ];
            namingContract =
              "Use var.project_name, var.environment, aws_vpc.main.id (or equivalent cloud VPC resource), and private subnet references.";
          } else {
            modules = [
              "1. Namespace, ConfigMap, ServiceAccount & RBAC",
              "2. Hardened Deployment, Service, TLS Ingress, HPA & NetworkPolicy",
            ];
            namingContract =
              "Use namespace: production, app label: app-service, ConfigMap name: app-config, ServiceAccount name: app-sa.";
          }
        }

        // ── Phase 2: Parallel Multi-Model Code Synthesis & Syntax Gate ──
        if (isModularTarget) {
          const baseSysPrompt =
            archetype === "terraform"
              ? TERRAFORM_SYNTHESIS_SYSTEM_PROMPT
              : KUBERNETES_SYNTHESIS_SYSTEM_PROMPT;
          const healSysPrompt =
            archetype === "terraform"
              ? TERRAFORM_HEALING_SYSTEM_PROMPT
              : KUBERNETES_HEALING_SYSTEM_PROMPT;

          sendEvent("status", {
            step: "synthesizing_module",
            module: `${modules[0]} + ${modules[1]}`,
            current: 1,
            total: modules.length,
          });

          // Synthesize Module 1 (worker-a) and Module 2 (worker-b) concurrently for fast multi-model execution
          const synthesizeSingleModule = async (modName: string, index: number) => {
            const isFirst = index === 0;
            const workerStage = isFirst ? "worker-a" : "worker-b";

            const tfProviderName = provider.toLowerCase().includes("google")
              ? "google"
              : provider.toLowerCase().includes("azure")
                ? "azurerm"
                : provider.toLowerCase().includes("digital")
                  ? "digitalocean"
                  : "aws";

            const moduleDirective =
              archetype === "terraform"
                ? isFirst
                  ? `Generate COMPLETE, production-ready Terraform HCL for Module 1 ("${modName}") on ${provider}.
Include:
1. terraform { required_version = ">= 1.6.0" required_providers { ... } backend ... }
2. provider "${tfProviderName}" { ... }
3. Core variable declarations (environment, region, project_name, etc.) and locals
4. Complete VPC, subnets, routing/NAT, and firewall/security group resources.`
                  : `Generate COMPLETE, production-ready Terraform HCL ONLY for Module 2 ("${modName}") on ${provider}.
CRITICAL RULES:
- Do NOT include terraform {} or provider {} blocks (they are in Module 1).
- Declare full, richly configured resources for compute/clusters, managed databases, object storage, KMS/IAM roles, and output blocks requested by the user.`
                : isFirst
                  ? `Generate COMPLETE, production-ready Kubernetes YAML manifests for Module 1 ("${modName}") on ${provider}.
Include Namespace, ServiceAccount, Role/RoleBinding (least privilege), and ConfigMap/Secret manifests separated by --- on its own line.`
                  : `Generate COMPLETE, production-ready Kubernetes YAML manifests ONLY for Module 2 ("${modName}") on ${provider}.
Do NOT redeclare the Namespace or ConfigMap from Module 1. Include Deployment (with restricted securityContext, livenessProbe, readinessProbe, resource requests/limits), Service, Ingress (with TLS), HorizontalPodAutoscaler v2, PodDisruptionBudget, and NetworkPolicy separated by --- on its own line.`;

            const synthPrompt = `${moduleDirective}

Shared Resource Naming Contract (MUST follow so Module 1 and Module 2 link cleanly):
${namingContract || "Use consistent resource names and labels across modules."}
${blueprintSummary ? `Architecture Summary: ${blueprintSummary}` : ""}

Repository / Stack Context:
${repoContext}

Architectural Decisions:
${JSON.stringify(userAnswers, null, 2)}

Output ONLY raw ${archetype === "terraform" ? "HCL" : "YAML"} code. Never wrap in markdown code fences.`;

            let chunkCode = "";
            let moduleErrors: string[] = [];
            let attempt = 0;

            while (attempt <= MAX_RETRIES) {
              if (attempt > 0) {
                sendEvent("status", {
                  step: "self_healing",
                  attempt,
                  module: modName,
                });
              }

              const healPrompt = `The following ${archetype} module ("${modName}") failed syntax validation:
Errors:
${moduleErrors.join("\n")}

Broken Code:
${chunkCode}

Fix ALL syntax/brace/indentation errors and return ONLY the corrected raw ${archetype === "terraform" ? "HCL" : "YAML"} code without markdown fences.`;

              const { content: rawOut } = await executeModelChain({
                roleLabel:
                  attempt === 0
                    ? `Worker ${index + 1}/${modules.length} (${modName})`
                    : `Healer (${modName} #${attempt})`,
                systemPrompt: attempt === 0 ? baseSysPrompt : healSysPrompt,
                userPrompt: attempt === 0 ? synthPrompt : healPrompt,
                maxTokens: 6000,
                temperature: 0.15,
                minChars: 60,
                chain: buildModelChain(selectedModel, attempt === 0 ? workerStage : "worker-heal"),
                onUsage: emitUsage,
              });

              chunkCode = cleanArtifactCode(rawOut, archetype, !isFirst);
              const errs = validateArtifact(chunkCode, archetype, provider);

              if (errs.length === 0) {
                return { code: chunkCode, errors: [] };
              }
              moduleErrors = errs;
              attempt++;
            }

            return { code: chunkCode, errors: moduleErrors };
          };

          const results = await Promise.all(
            modules.map((modName, idx) => synthesizeSingleModule(modName, idx))
          );

          sendEvent("status", { step: "validating" });

          for (const res of results) {
            if (res.code) {
              finalOutput = joinModularCode(finalOutput, res.code, archetype);
            }
            if (res.errors.length > 0) {
              unresolvedErrors.push(...res.errors);
            }
          }

          // Final combined validation check
          const combinedErrs = validateArtifact(finalOutput, archetype, provider);
          unresolvedErrors = combinedErrs;

          if (finalOutput) {
            sendEvent("partial", { code: finalOutput });
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
                  ? `Output a complete, comprehensive, single-document ${provider} YAML configuration (80-150 lines) including explicit triggers, least-privilege permissions/OIDC, dependency & Docker layer caching, lint/unit test jobs, SAST/secret/container CVE scanning jobs, and deployment.`
                  : `Output a complete, comprehensive, production-grade Compose v2 YAML file (70-140 lines, starting with 'services:' — omit deprecated top-level 'version:') with full service definitions, healthchecks, depends_on with service_healthy conditions, isolated frontend/backend bridge networks, named persistent volumes, restart policies, and resource limits.`;

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

Fix ALL syntax, duplicate-key, or structural errors while keeping all jobs/services, security scans, caching, networks, and healthchecks intact. Output ONLY the complete corrected raw configuration file without markdown code fences.`;

            const { content: rawOut } = await executeModelChain({
              roleLabel:
                attempt === 0
                  ? `Phase 2 · Code Synthesizer (${targetLabel})`
                  : `Phase 2 · Syntax Healer (#${attempt})`,
              systemPrompt: attempt === 0 ? baseSysPrompt : healSysPrompt,
              userPrompt: attempt === 0 ? synthPrompt : healPrompt,
              maxTokens: 6000,
              temperature: 0.15,
              minChars: 120,
              chain: buildModelChain(selectedModel, workerStage),
              onUsage: emitUsage,
            });

            docCode = cleanArtifactCode(rawOut, archetype, false);

            sendEvent("status", { step: "validating" });

            const errs = validateArtifact(docCode, archetype, provider);
            if (errs.length === 0) {
              docValid = true;
              docErrors = [];
              unresolvedErrors = [];
              sendEvent("partial", { code: docCode });
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

        // ── Phase 3: Fast Completeness Check (No Full-File Rewrite Bottleneck) ──
        if (unresolvedErrors.length === 0 && finalOutput.trim().length > 0) {
          sendEvent("status", { step: "semantic_validation" });

          try {
            const valSystem = `You are a Principal Infrastructure Reviewer. Verify that the generated ${archetype} configuration for ${provider} is structurally complete and addresses the user's stack. Respond strictly in JSON: {"status": "VALID", "summary": "1-sentence verification summary"}.`;
            const valUser = `Target: ${archetype} on ${provider}\nGenerated Lines: ${finalOutput.split("\n").length}\nCode Preview:\n${finalOutput.slice(0, 3500)}`;

            await executeModelChain({
              roleLabel: "Phase 3 · Completeness Verifier",
              systemPrompt: valSystem,
              userPrompt: valUser,
              maxTokens: 600,
              temperature: 0.1,
              jsonMode: true,
              minChars: 10,
              chain: buildModelChain(
                selectedModel === "multi-agent" ? "qwen-3.8-27b" : selectedModel,
                "validator"
              ),
              onUsage: emitUsage,
            });
          } catch (valErr) {
            console.warn("[Synthesize] Completeness check non-blocking warning:", valErr);
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
        streamClosed = true;
        try {
          controller.close();
        } catch {
          // Ignore already closed controller
        }
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
  stripDuplicateTerraformHeader: boolean
): string {
  let text = stripReasoningArtifacts(raw);

  const fenceMatch = text.match(/```(?:[a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1] && fenceMatch[1].trim().length > 30) {
    text = fenceMatch[1];
  } else {
    text = text.replace(/^```[a-zA-Z0-9_-]*\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  }

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
          break;
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
