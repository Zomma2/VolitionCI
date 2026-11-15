import Link from "next/link";
import Wizard from "@/components/wizard/Wizard";
import { EXAMPLE_BLUEPRINTS } from "@/lib/examplesData";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  FileCode2,
  GitPullRequest,
  Layers,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const PIPELINE_STAGES = [
  {
    step: "01",
    title: "Repository & Stack Ingestion",
    description:
      "Inspect public GitHub trees recursively via the GitHub REST API without cloning source code, consult interactively with the AI Architect, or compose stacks manually.",
    detail: "Detects package.json, go.mod, Cargo.toml, Dockerfile, Helm & Terraform manifests",
    icon: GitPullRequest,
  },
  {
    step: "02",
    title: "Context-Aware Interrogation",
    description:
      "Generates targeted architectural trade-off questions tailored to your stack — covering OIDC authentication, remote state locking, ingress controllers, and SAST/SBOM gates.",
    detail: "Dynamic card-based matrix with 1-click recommended defaults",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Modular ReAct Planner-Worker",
    description:
      "Decomposes complex topologies into 2-5 isolated modules (Networking, IAM, Compute, Data) synthesized sequentially with shared resource ID context to prevent token truncation.",
    detail: "Eliminates mid-file cutoffs on multi-resource HCL and Kubernetes specs",
    icon: Layers,
  },
  {
    step: "04",
    title: "Deterministic Linting & Self-Healing",
    description:
      "Every module passes multi-document YAML parsing or string-aware HCL structural verification plus an LLM Semantic Completeness Validator, triggering up to 3 automated repair loops.",
    detail: "js-yaml loadAll + HCL block/brace verifier + semantic contract gate",
    icon: Cpu,
  },
];

const ROUTING_MATRIX = [
  {
    stage: "Consultative Builder",
    endpoint: "/api/chat-builder",
    primary: "Gemini 3.6 Flash",
    fallback1: "Groq GPT-OSS 20B",
    fallback2: "Balanced-brace JSON recovery",
  },
  {
    stage: "Repository Stack Analyzer",
    endpoint: "/api/analyze",
    primary: "Groq Qwen 3.8 27B",
    fallback1: "Octokit Git Tree Indexer",
    fallback2: "Deterministic path heuristics",
  },
  {
    stage: "Phase 1 · Infra Planner",
    endpoint: "/api/synthesize",
    primary: "Gemini 3.6 Flash",
    fallback1: "Cohere Command R+ (08-2024)",
    fallback2: "Groq GPT-OSS 20B",
  },
  {
    stage: "Phase 2 · Code Worker",
    endpoint: "/api/synthesize",
    primary: "Gemini 3.6 Flash",
    fallback1: "Mistral Codestral Latest",
    fallback2: "Groq GPT-OSS 120B",
  },
  {
    stage: "Phase 3 · Semantic Gate",
    endpoint: "/api/synthesize",
    primary: "Gemini 3.6 Flash",
    fallback1: "Mistral Codestral Latest",
    fallback2: "Groq GPT-OSS 20B",
  },
];

export default function Home() {
  const featuredBlueprints = EXAMPLE_BLUEPRINTS.slice(0, 3);

  return (
    <div className="bg-grid-surface">
      {/* Top Engineering Hero */}
      <section className="border-b border-white/[0.07] bg-gradient-to-b from-[#09090b] via-[#09090b]/95 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] font-mono text-[11px] text-cyan-300">
                <Terminal size={12} className="text-cyan-400" />
                <span>REACT PLANNER-WORKER · SELF-HEALING IAC &amp; CI/CD</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-[1.12] text-zinc-100">
                Synthesize verified DevSecOps pipelines and cloud infrastructure.
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
                Analyze live GitHub repositories or consult with an infrastructure architect to
                generate syntax-validated GitHub Actions, GitLab CI, Terraform HCL, Kubernetes
                manifests, and Docker Compose topologies.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#studio"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                >
                  <span>Start in Synthesis Studio</span>
                  <ArrowRight size={13} />
                </a>
                <Link
                  href="/examples"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.09] transition-colors"
                >
                  <FileCode2 size={13} className="text-zinc-400" />
                  <span>Browse Blueprints ({EXAMPLE_BLUEPRINTS.length})</span>
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <BookOpen size={13} />
                  <span>Architecture Docs</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-lg bg-[#0d0f14] border border-white/[0.07]">
                <div className="font-mono text-[11px] text-zinc-500">TARGETS</div>
                <div className="text-sm font-semibold text-zinc-100 mt-1">4 Core Archetypes</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  CI/CD, Terraform, K8s, Compose
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0d0f14] border border-white/[0.07]">
                <div className="font-mono text-[11px] text-zinc-500">SYNTHESIS</div>
                <div className="text-sm font-semibold text-zinc-100 mt-1">Modular ReAct Loop</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Zero mid-file token truncation
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0d0f14] border border-white/[0.07]">
                <div className="font-mono text-[11px] text-zinc-500">VALIDATION</div>
                <div className="text-sm font-semibold text-zinc-100 mt-1">3x Self-Healing</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  YAML AST, HCL brace &amp; semantic
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0d0f14] border border-white/[0.07]">
                <div className="font-mono text-[11px] text-zinc-500">RESILIENCE</div>
                <div className="text-sm font-semibold text-zinc-100 mt-1">4-Provider Failover</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Gemini, Codestral, Cohere, Groq
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Synthesis Studio */}
      <main id="studio" className="scroll-mt-16 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <Wizard />
      </main>

      {/* ReAct Pipeline Architecture Section */}
      <section className="border-t border-white/[0.07] bg-[#07080b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                Verification Architecture
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Engineered to eliminate hallucinated YAML and broken HCL
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl">
                Single-shot LLM prompts frequently truncate large infrastructure manifests or invent
                invalid resource blocks. VolitionCI enforces a 4-stage verification pipeline.
              </p>
            </div>
            <Link
              href="/docs#architecture"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 shrink-0"
            >
              <span>Read technical specification</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PIPELINE_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="p-5 rounded-xl bg-[#0d0f14] border border-white/[0.07] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-md bg-zinc-900 border border-white/[0.08] flex items-center justify-center">
                        <Icon size={15} className="text-cyan-400" />
                      </div>
                      <span className="font-mono text-xs text-zinc-500">{stage.step}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100">{stage.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{stage.description}</p>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06] font-mono text-[11px] text-zinc-500">
                    {stage.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Blueprints Preview */}
      <section className="border-t border-white/[0.07] bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                Production Blueprints
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Start from verified reference architectures
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl">
                Inspect complete zero-trust configurations in Monaco or load any blueprint directly
                into the Consultative AI Builder to tailor it to your environment.
              </p>
            </div>
            <Link
              href="/examples"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.09] shrink-0"
            >
              <span>View all {EXAMPLE_BLUEPRINTS.length} blueprints</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {featuredBlueprints.map((bp) => (
              <div
                key={bp.id}
                className="p-5 rounded-xl bg-[#0d0f14] border border-white/[0.08] flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                      {bp.archetype} · {bp.targetPlatform}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">{bp.filePath}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100">{bp.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{bp.summary}</p>

                  <ul className="space-y-1.5 pt-1">
                    {bp.highlights.slice(0, 2).map((h) => (
                      <li key={h} className="flex items-start gap-2 text-[11px] text-zinc-300">
                        <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-white/[0.07] flex items-center gap-2">
                  <Link
                    href={`/?blueprint=${bp.id}#studio`}
                    className="flex-1 text-center py-2 px-3 rounded-md text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                  >
                    Open in Editor
                  </Link>
                  <Link
                    href={`/?blueprint=${bp.id}&mode=customize#studio`}
                    className="flex-1 text-center py-2 px-3 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.09] transition-colors"
                  >
                    Customize with AI
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Provider LLM Failover Matrix */}
      <section className="border-t border-white/[0.07] bg-[#07080b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
              High-Availability Inference
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Multi-provider LLM routing &amp; automatic failover
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Every synthesis phase executes against an ordered provider chain. Rate limits or
              upstream outages trigger transparent sub-second failover with full token telemetry.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0d0f14]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#090b0f] font-mono text-[11px] uppercase text-zinc-400">
                  <th className="py-3 px-4">Execution Stage</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Primary Engine</th>
                  <th className="py-3 px-4">Fallback 1</th>
                  <th className="py-3 px-4">Fallback 2 / Safeguard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {ROUTING_MATRIX.map((row) => (
                  <tr key={row.stage} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-100">{row.stage}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{row.endpoint}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {row.primary}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-300">{row.fallback1}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{row.fallback2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
