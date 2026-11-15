import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const maxDuration = 60;

const GEMINI_MODEL = "models/gemini-3.6-flash";
const GROQ_MODEL = "openai/gpt-oss-20b";

type ArchetypeKey = "pipeline" | "terraform" | "kubernetes" | "docker";

const DOMAIN_DIRECTIVES: Record<ArchetypeKey, string> = {
  pipeline: `ACTIVE GENERATION TARGET: CI/CD PIPELINE
Persona: Principal DevSecOps & Release Pipeline Architect.
Domain Focus:
- Evaluate workflow triggers, dependency/Buildx caching, parallel test matrices, SAST/secret scanning, container CVE gates, SBOM/Cosign attestation, and zero-trust OIDC cloud deployment (never static long-lived cloud keys).
- Follow-up questions on Turn 1 MUST target CI/CD specifics (e.g., OIDC cloud deployment target, staging vs production promotion gates, database migration execution order, or container registry destination).
- Preferred verified tool recommendations (pick 2-4 relevant ones): Trivy (slug: "trivy", color: "38BDF8"), Semgrep (slug: "semgrep", color: "34D399"), SonarQube (slug: "sonar", color: "38BDF8"), Cosign (slug: "cosign", color: "A78BFA"), Gitleaks (slug: "gitleaks", color: "FB7185"), Snyk (slug: "snyk", color: "C084FC").`,

  terraform: `ACTIVE GENERATION TARGET: TERRAFORM HCL INFRASTRUCTURE
Persona: Principal Cloud Infrastructure & Terraform State Architect.
Domain Focus:
- Evaluate remote state backends and state locking (S3 + DynamoDB, GCS, Azure Blob), multi-AZ VPC CIDR layout, public/private/isolated database subnets, NAT gateway cost vs HA trade-offs, KMS customer-managed encryption keys, and scoped least-privilege IAM roles.
- Follow-up questions on Turn 1 MUST target cloud provisioning specifics (e.g., remote state backend preference, single-NAT vs multi-AZ HA topology, database failover/backup retention, or target cloud region/CIDR constraints).
- Preferred verified tool recommendations (pick 2-4 relevant ones): Checkov (slug: "checkov", color: "4ADE80"), OpenTofu (slug: "opentofu", color: "FFDA18"), HashiCorp Vault (slug: "vault", color: "FACC15"), Trivy IaC (slug: "trivy", color: "38BDF8"), Cloudflare (slug: "cloudflare", color: "FB923C"), Datadog (slug: "datadog", color: "C084FC").`,

  kubernetes: `ACTIVE GENERATION TARGET: KUBERNETES MANIFESTS
Persona: Principal CNCF Kubernetes Workload & Cluster Policy Architect.
Domain Focus:
- Evaluate restricted PodSecurity contexts (runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities), deterministic CPU/memory requests & limits, HorizontalPodAutoscaler v2 metrics, PodDisruptionBudgets, default-deny NetworkPolicies, TLS Ingress/Gateway controllers, and GitOps sync strategy.
- Follow-up questions on Turn 1 MUST target Kubernetes cluster specifics (e.g., Ingress controller + TLS issuer choice, HPA scaling thresholds and replica bounds, StatefulSet PVC storage class, or external secret injection strategy).
- Preferred verified tool recommendations (pick 2-4 relevant ones): Helm (slug: "helm", color: "38BDF8"), ArgoCD (slug: "argo", color: "FB923C"), Cert-Manager (slug: "letsencrypt", color: "38BDF8"), Prometheus (slug: "prometheus", color: "F97316"), Grafana (slug: "grafana", color: "FB923C"), Istio (slug: "istio", color: "60A5FA"), Cilium (slug: "cilium", color: "FACC15").`,

  docker: `ACTIVE GENERATION TARGET: DOCKER COMPOSE TOPOLOGY
Persona: Principal Container Runtime & Distributed Compose Architect.
Domain Focus:
- Evaluate multi-network bridge isolation (separating public reverse-proxy networks from private database/cache networks), strict healthcheck probes with depends_on service_healthy conditions, named persistent volumes, container memory/CPU limits, restart policies, and .env secret externalization.
- Follow-up questions on Turn 1 MUST target container topology specifics (e.g., reverse proxy TLS termination vs local port mapping, persistent volume strategy for stateful stores, resource limits, or observability sidecars).
- Preferred verified tool recommendations (pick 2-4 relevant ones): Nginx (slug: "nginx", color: "22C55E"), Traefik (slug: "traefikproxy", color: "24A1C1"), Redis (slug: "redis", color: "F87171"), Prometheus (slug: "prometheus", color: "F97316"), Grafana (slug: "grafana", color: "FB923C"), Trivy (slug: "trivy", color: "38BDF8").`,
};

function extractFirstJsonObject(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    // Continue to balanced brace extraction
  }

  const start = raw.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
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
          const candidate = raw.substring(start, i + 1);
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

export async function POST(req: NextRequest) {
  try {
    const {
      history,
      currentConfig,
      revision,
      selectedArchetype,
      selectedPlatform,
    } = await req.json();

    const isFirstTurn = revision === 0;
    const activeArchetype: ArchetypeKey = ["pipeline", "terraform", "kubernetes", "docker"].includes(
      selectedArchetype
    )
      ? selectedArchetype
      : currentConfig?.archetype || "pipeline";

    const activePlatform =
      selectedPlatform ||
      currentConfig?.targetPlatform ||
      (activeArchetype === "terraform"
        ? "AWS"
        : activeArchetype === "kubernetes"
          ? "Generic Kubernetes"
          : activeArchetype === "docker"
            ? "Local Development"
            : "GitHub Actions");

    const systemPrompt = `You are a senior DevOps and Cloud Infrastructure Architect acting as a consultative specialist inside VolitionCI.

${DOMAIN_DIRECTIVES[activeArchetype]}

USER'S CURRENTLY SELECTED TARGET TAB:
- archetype: "${activeArchetype}"
- targetPlatform: "${activePlatform}"
Keep config.archetype set to "${activeArchetype}" (and config.targetPlatform aligned with "${activePlatform}") UNLESS the user's message explicitly requests switching to a different target type or cloud/CI platform.

${
  isFirstTurn
    ? `IMPORTANT -- FIRST INTERACTION PROTOCOL:
This is the user's FIRST message in the "${activeArchetype}" studio workspace. Act as the specialist architect above:
1. Open with a concise, authoritative assessment tailored specifically to ${activeArchetype.toUpperCase()} on ${activePlatform}.
2. Provide an initial draft config extracting their stack and technologies.
3. Point out 1-2 critical architectural or security considerations specific to ${activeArchetype} (using domain-accurate terminology).
4. At the END of your reply, ask 1 to 2 targeted follow-up questions addressing concrete missing requirements that directly alter the synthesized ${activeArchetype} artifact.
5. Recommend 2 to 4 relevant tools with crisp dark-mode hex colors (bright hexes only, never black or dark navy).`
    : `IMPORTANT -- REFINEMENT PROTOCOL:
This is a follow-up revision for "${activeArchetype}". The user is answering your previous questions or refining their stack:
1. Incorporate all user answers into the configuration and technologies list.
2. Summarize the finalized ${activeArchetype} specification clearly and concisely so they are ready to proceed to Architectural Interrogation.
3. Do NOT ask further questions unless a critical blocker remains.
4. Refresh tool recommendations for the refined specification.`
}

Output MUST be a valid JSON object matching this exact schema (no markdown code fences):
{
  "reply": "Your consultative architectural response (plain text with line breaks, zero emojis)",
  "config": {
    "archetype": "pipeline" | "terraform" | "kubernetes" | "docker",
    "targetPlatform": "string",
    "repoUrl": "string | null",
    "technologies": ["tech1", "tech2"],
    "recommendations": [
      { "name": "Tool Name", "slug": "verified-slug", "color": "BRIGHT_HEX_NO_HASH", "reason": "Concise architectural rationale" }
    ]
  }
}

Current Config Context (if any):
${JSON.stringify(currentConfig)}

Analyze the conversation history and output valid JSON only. Never use emojis anywhere in your output.`;

    const userMessages = (history || [])
      .map((h: any) => `${h.role}: ${h.content}`)
      .join("\n");
    let parsed: any;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userMessages }] }],
        generationConfig: {
          maxOutputTokens: 1200,
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });
      const rawText = result.response.text();
      parsed = extractFirstJsonObject(rawText);
      if (!parsed) {
        throw new Error("Failed to parse JSON from Gemini response");
      }
    } catch (geminiErr: any) {
      console.warn("Gemini failed in chat-builder, falling back to Groq:", geminiErr?.message);

      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessages },
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      });

      const rawContent = completion.choices[0]?.message?.content || "{}";
      parsed = extractFirstJsonObject(rawContent) || {};
    }

    if (parsed?.config) {
      if (!parsed.config.archetype) parsed.config.archetype = activeArchetype;
      if (!parsed.config.targetPlatform) parsed.config.targetPlatform = activePlatform;
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Chat builder error:", error);
    return NextResponse.json(
      { reply: "I encountered an error analyzing your request.", config: null },
      { status: 500 }
    );
  }
}
