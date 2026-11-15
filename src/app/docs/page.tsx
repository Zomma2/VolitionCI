import type { Metadata } from "next";
import Link from "next/link";
import CopyCodeBlock from "@/components/docs/CopyCodeBlock";
import { ArrowRight, CheckCircle2, ShieldCheck, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Technical architecture, ReAct synthesis workflow, YAML & HCL self-healing validation, multi-provider LLM routing, and API reference for VolitionCI.",
};

const DOC_SECTIONS = [
  { id: "overview", label: "Overview & Quickstart" },
  { id: "ingestion", label: "Ingestion Workflows" },
  { id: "architecture", label: "ReAct Planner-Worker Engine" },
  { id: "validation", label: "Validation & Self-Healing" },
  { id: "security-baselines", label: "Zero-Trust Security Baselines" },
  { id: "model-routing", label: "Multi-Provider LLM Routing" },
  { id: "environment", label: "Environment Variables" },
  { id: "api-reference", label: "REST & SSE API Reference" },
];

const ENV_SETUP_SNIPPET = `# .env.local
GEMINI_API_KEY="your_google_gemini_api_key"
GROQ_API_KEY="your_groq_api_key"
MISTRAL_API_KEY="your_mistral_codestral_key"
COHERE_API_KEY="your_cohere_api_key"

# Optional: Elevates GitHub REST API rate limits during repository scanning
GITHUB_TOKEN="ghp_optional_personal_access_token"`;

const ANALYZE_CURL_SNIPPET = `curl -X POST https://volition-ci.vercel.app/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "repoUrl": "https://github.com/Zomma2/VolitionCI",
    "archetype": "pipeline",
    "targetPlatform": "GitHub Actions"
  }'`;

const SYNTHESIZE_SSE_SNIPPET = `event: status
data: {"step":"planning"}

event: usage
data: {"model":"gemini-3.6-flash","role":"Planner (Primary)","usage":{"prompt_tokens":312,"completion_tokens":84,"total_tokens":396}}

event: status
data: {"step":"synthesizing_module","module":"Networking","current":1,"total":4}

event: status
data: {"step":"validating"}

event: status
data: {"step":"semantic_validation"}

event: complete
data: {"code":"terraform {\\n  required_version = \\">= 1.7.0\\"\\n..."}`;

export default function DocsPage() {
  return (
    <div className="bg-grid-surface flex-1">
      <section className="border-b border-white/[0.07] bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
            Platform Documentation
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            VolitionCI Architecture &amp; Reference
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Complete engineering documentation covering repository ingestion, ReAct modular code
            synthesis, deterministic YAML and HCL verification, provider failover, and SSE APIs.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
          <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/[0.08] space-y-3">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              On This Page
            </div>
            <nav aria-label="Documentation sections" className="flex flex-col gap-1">
              {DOC_SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition-colors"
                >
                  {sec.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
              <Terminal size={13} className="text-cyan-400" />
              <span>Ready to synthesize?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Open the Studio workspace or start from a pre-verified blueprint.
            </p>
            <div className="pt-1 flex flex-col gap-2">
              <Link
                href="/#studio"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
              >
                <span>Open Synthesis Studio</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/examples"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors"
              >
                <span>Browse Blueprints</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Documentation Content */}
        <main className="lg:col-span-9 space-y-12">
          {/* 1. Overview */}
          <section id="overview" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 border-b border-white/[0.08] pb-2.5">
              1. Overview &amp; Quickstart
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              VolitionCI is an autonomous DevSecOps and Infrastructure-as-Code generation engine.
              Rather than relying on brittle single-prompt completions, VolitionCI separates
              infrastructure authoring into four deterministic stages:{" "}
              <span className="text-zinc-100 font-medium">
                Context Ingestion, Architectural Interrogation, Modular ReAct Synthesis, and
                Self-Healing Verification
              </span>
              .
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1.5">
                <div className="font-mono text-xs text-cyan-300">CI/CD Pipelines</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  GitHub Actions, GitLab CI, Bitbucket Pipelines, CircleCI, and Jenkinsfile
                  specifications with SAST, SBOM, and OIDC deployment stages.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1.5">
                <div className="font-mono text-xs text-cyan-300">Terraform HCL</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Modular cloud topologies across AWS, Google Cloud, Azure, and DigitalOcean with
                  encrypted state backends and isolated VPC networking.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1.5">
                <div className="font-mono text-xs text-cyan-300">Kubernetes Manifests</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Multi-document Deployment, Service, Ingress, HPA v2, and NetworkPolicy manifests
                  calibrated for EKS, GKE, AKS, or vanilla clusters.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1.5">
                <div className="font-mono text-xs text-cyan-300">Docker Compose</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Polyglot local and swarm container topologies featuring healthcheck dependency
                  graphs, internal networks, and named volumes.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Ingestion */}
          <section id="ingestion" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 border-b border-white/[0.08] pb-2.5">
              2. Ingestion Workflows
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Step 1 of the Studio supports three distinct entry points depending on whether you are
              starting from greenfield requirements or an existing repository:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">
                  A. Consultative AI Architect
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Describe your target architecture in natural language. On Turn 1, the architect
                  extracts an initial configuration draft, flags ambiguities (such as state locking,
                  multi-AZ database placement, or migration hooks), asks 1-2 targeted clarifying
                  questions, and proposes ecosystem tooling you can toggle on or off.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">
                  B. GitHub Repository Tree Scanner
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Queries the GitHub Git Trees REST API (`recursive=true`) via Octokit to index
                  build manifests (`package.json`, `pom.xml`, `go.mod`, `Cargo.toml`,
                  `requirements.txt`), existing `Dockerfile` specs, Helm charts, and `.tf` files
                  without cloning proprietary source code onto disk.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">C. Manual Stack Composer</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Card-driven selector curated per cloud provider and cluster runtime for rapid,
                  deterministic stack assembly without conversational turns.
                </p>
              </div>
            </div>
          </section>

          {/* 3. ReAct Architecture */}
          <section id="architecture" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 border-b border-white/[0.08] pb-2.5">
              3. ReAct Planner-Worker Synthesis Engine
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Large cloud architectures regularly exceed single-call output token budgets on
              high-speed inference providers, causing truncated YAML/HCL files. VolitionCI solves
              this in `/api/synthesize` via a three-phase streaming architecture:
            </p>
            <ol className="space-y-3 text-xs text-zinc-300">
              <li className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07]">
                <span className="font-mono text-cyan-300 font-semibold block mb-1">
                  Phase 1 · Modular Infrastructure Planner
                </span>
                Evaluates the repository context and interrogation answers to decompose the target
                into 2 to 5 ordered modules — for example{" "}
                <code className="font-mono text-zinc-200">
                  [&quot;Provider Settings&quot;, &quot;Networking&quot;, &quot;IAM&quot;,
                  &quot;Compute&quot;, &quot;Database&quot;]
                </code>
                .
              </li>
              <li className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07]">
                <span className="font-mono text-cyan-300 font-semibold block mb-1">
                  Phase 2 · Context-Chaining Worker Loop
                </span>
                Iterates sequentially across planned modules. Each Worker invocation receives all
                previously verified code so resource references (such as{" "}
                <code className="font-mono text-zinc-200">aws_vpc.core.id</code> or shared pipeline
                job names) remain consistent across module boundaries.
              </li>
              <li className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07]">
                <span className="font-mono text-cyan-300 font-semibold block mb-1">
                  Phase 3 · Semantic Completeness Validator
                </span>
                Cross-checks the assembled artifact against every user-selected stack component and
                interrogation answer, flagging any omitted service (`MISSING: &lt;component&gt;`)
                prior to finalizing delivery.
              </li>
            </ol>
          </section>

          {/* 4. Validation & Self-Healing */}
          <section id="validation" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 border-b border-white/[0.08] pb-2.5">
              4. Deterministic Validation &amp; Self-Healing Gate
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Every synthesized module is concatenated with prior output and validated before the
              Worker advances:
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-zinc-100">YAML Multi-Document Parsing:</strong> Validated
                  through <code className="font-mono">YAML.loadAll()</code> (`js-yaml`), ensuring
                  both single-document CI pipelines and `---`-delimited Kubernetes manifests parse
                  without indentation or anchor errors.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-zinc-100">HCL Structural &amp; Root-Block Audit:</strong>{" "}
                  Tracks string-literal and escape-aware brace depth while asserting recognizable
                  top-level Terraform declarations (`terraform`, `provider`, `resource`, `variable`,
                  `module`, `output`, `data`).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-zinc-100">Automated 3-Attempt Remediation:</strong> When a
                  linter error occurs, the exact diagnostic stack trace is fed back into a dedicated
                  healing prompt for up to 3 automated repair cycles.
                </span>
              </li>
            </ul>
          </section>

          {/* 5. Security Baselines */}
          <section id="security-baselines" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 border-b border-white/[0.08] pb-2.5">
              5. Zero-Trust Security Baselines
            </h2>
            <div className="p-4 rounded-xl bg-[#0d0f14] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>Default Hardening Controls Applied Across Archetypes</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-400">
                <div>
                  <strong className="text-zinc-200 block mb-0.5">Keyless Cloud OIDC</strong>
                  Prefers short-lived federated JWT credentials (`id-token: write`) over static IAM
                  access keys in CI workflows.
                </div>
                <div>
                  <strong className="text-zinc-200 block mb-0.5">PodSecurity Restricted</strong>
                  Enforces `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, and dropped
                  Linux capabilities on Kubernetes workloads.
                </div>
                <div>
                  <strong className="text-zinc-200 block mb-0.5">Encrypted Remote State</strong>
                  Configures KMS encryption and state locking (`dynamodb_table` / GCS locks) on
                  Terraform backends.
                </div>
                <div>
                  <strong className="text-zinc-200 block mb-0.5">Supply-Chain Attestation</strong>
                  Integrates Trivy CVE gates, Semgrep SAST, Gitleaks secret audits, Syft SBOMs, and
                  Sigstore Cosign signing.
                </div>
              </div>
            </div>
          </section>

          {/* 6. Model Routing */}
          <section id="model-routing" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 border-b border-white/[0.08] pb-2.5">
              6. Multi-Provider LLM Routing
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              `runModelChain` executes each role against an ordered provider list, emitting live
              `usage` SSE telemetry tagged `(Primary)` or `(Fallback N)`:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1.5">
                <div className="font-mono text-cyan-300 font-semibold">PLANNER_CHAIN</div>
                <ol className="list-decimal list-inside text-zinc-400 space-y-1 font-mono text-[11px]">
                  <li>gemini-3.6-flash</li>
                  <li>command-r-plus-08-2024</li>
                  <li>openai/gpt-oss-20b</li>
                </ol>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1.5">
                <div className="font-mono text-cyan-300 font-semibold">WORKER_CHAIN</div>
                <ol className="list-decimal list-inside text-zinc-400 space-y-1 font-mono text-[11px]">
                  <li>gemini-3.6-flash</li>
                  <li>codestral-latest</li>
                  <li>openai/gpt-oss-120b</li>
                </ol>
              </div>
              <div className="p-4 rounded-lg bg-[#0d0f14] border border-white/[0.07] space-y-1.5">
                <div className="font-mono text-cyan-300 font-semibold">VALIDATOR_CHAIN</div>
                <ol className="list-decimal list-inside text-zinc-400 space-y-1 font-mono text-[11px]">
                  <li>gemini-3.6-flash</li>
                  <li>codestral-latest</li>
                  <li>openai/gpt-oss-20b</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 7. Environment Variables */}
          <section id="environment" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 border-b border-white/[0.08] pb-2.5">
              7. Self-Hosting &amp; Environment Configuration
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              To run VolitionCI locally or deploy to Vercel, configure the following keys in
              `.env.local` or your project secret store:
            </p>
            <CopyCodeBlock title=".env.local" code={ENV_SETUP_SNIPPET} />
          </section>

          {/* 8. API Reference */}
          <section id="api-reference" className="scroll-mt-20 space-y-4">
            <h2 className="text-xl font-bold text-zinc-100 border-b border-white/[0.08] pb-2.5">
              8. REST &amp; SSE API Reference
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                    POST
                  </span>
                  <span className="text-zinc-100">/api/analyze</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Inspects a GitHub repository URL or manual stack array and returns detected
                  languages plus architectural interrogation questions.
                </p>
                <CopyCodeBlock title="Request Example" code={ANALYZE_CURL_SNIPPET} />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    POST (SSE Stream)
                  </span>
                  <span className="text-zinc-100">/api/synthesize</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Streams Server-Sent Events (`status`, `usage`, `complete`, `error`) as the
                  Planner, Worker loop, and Semantic Validator execute.
                </p>
                <CopyCodeBlock title="Server-Sent Event Stream" code={SYNTHESIZE_SSE_SNIPPET} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
