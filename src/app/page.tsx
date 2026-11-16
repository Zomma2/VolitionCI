import Link from "next/link";
import Wizard from "@/components/wizard/Wizard";
import { EXAMPLE_BLUEPRINTS } from "@/lib/examplesData";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import TechIcon from "@/components/ui/TechIcon";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  FileCode2,
  GitPullRequest,
  Layers,
  ShieldCheck,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Repository or Stack Input",
    description:
      "Point to a public GitHub repository to index manifests (`package.json`, `go.mod`, `Dockerfile`, `.tf`, `helm`), describe your setup in chat, or select components manually.",
    detail: "GitHub REST tree inspection · Stack Composer · Interactive Architect",
    icon: GitPullRequest,
  },
  {
    step: "02",
    title: "Configuration & Policy Choices",
    description:
      "Answer targeted questions for your environment — covering cloud auth (OIDC), state backends, ingress controllers, autoscaling, and security scanners.",
    detail: "Context-specific options with 1-click defaults",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Modular Generation",
    description:
      "Splits large Terraform and Kubernetes specs into logical sections (Networking, Compute, Data, Policy) so outputs stay complete without mid-file cutoffs.",
    detail: "Selectable models: Codestral, Gemini 3.6, GPT-OSS 120B, Command A, Qwen 3.8",
    icon: Layers,
  },
  {
    step: "04",
    title: "Syntax Check & Editor Export",
    description:
      "Runs YAML parsing (`js-yaml`), HCL brace/block checks, and completeness verification before loading the file into Monaco for inline editing and download.",
    detail: "Multi-document YAML · HCL2 block check · 1-click model comparison",
    icon: Cpu,
  },
];

const SUPPORTED_ARTIFACTS = [
  {
    archetype: "pipeline" as const,
    title: "CI/CD Workflows",
    path: ".github/workflows/pipeline.yml",
    platforms: "GitHub Actions · GitLab CI · Bitbucket · CircleCI · Jenkins",
  },
  {
    archetype: "terraform" as const,
    title: "Terraform HCL",
    path: "infra/main.tf",
    platforms: "AWS · Google Cloud · Azure · DigitalOcean",
  },
  {
    archetype: "kubernetes" as const,
    title: "Kubernetes Manifests",
    path: "k8s/manifests.yaml",
    platforms: "Generic K8s · Amazon EKS · Google GKE · Azure AKS",
  },
  {
    archetype: "docker" as const,
    title: "Docker Compose",
    path: "docker-compose.yml",
    platforms: "Local Dev · Production Swarm · Ephemeral CI",
  },
];

const ROUTING_MATRIX = [
  {
    stage: "Interactive Architect",
    endpoint: "/api/chat-builder",
    primary: "Gemini 3.6 Flash",
    fallback1: "Groq GPT-OSS 120B",
    fallback2: "Cohere Command A",
  },
  {
    stage: "Repository & Stack Analyzer",
    endpoint: "/api/analyze",
    primary: "Groq Qwen 3.8 27B",
    fallback1: "Gemini 3.6 Flash",
    fallback2: "Cohere Command A",
  },
  {
    stage: "Phase 1 · Architecture Planner",
    endpoint: "/api/synthesize",
    primary: "Cohere Command A",
    fallback1: "Gemini 3.6 Flash",
    fallback2: "Groq Qwen 3.8 27B",
  },
  {
    stage: "Phase 2 · Code Generation",
    endpoint: "/api/synthesize",
    primary: "Mistral Codestral + Gemini 3.6",
    fallback1: "Groq GPT-OSS 120B",
    fallback2: "Cohere Command A",
  },
  {
    stage: "Phase 3 · Completeness Check",
    endpoint: "/api/synthesize",
    primary: "Groq GPT-OSS 120B",
    fallback1: "Gemini 3.6 Flash",
    fallback2: "Mistral Codestral",
  },
];

export default function Home() {
  const featuredBlueprints = EXAMPLE_BLUEPRINTS.slice(0, 3);

  return (
    <div className="bg-grid-surface">
      {/* Top Product Header Section */}
      <section className="border-b border-white/[0.07] bg-gradient-to-b from-[#09090b] via-[#09090b]/95 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-9 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-white/[0.08] font-mono text-[11px] text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>v0.4.2 Public Beta · DevSecOps &amp; IaC Configuration Studio</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight leading-[1.14] text-zinc-100">
                Draft and validate CI/CD workflows, Terraform modules, Kubernetes manifests, and Compose files.
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
                Configure deployment pipelines and cloud infrastructure from your GitHub repository
                structure or stack selection. Compare outputs across multiple code models with
                built-in YAML and HCL syntax checks before export.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#studio"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                >
                  <span>Open Studio</span>
                  <ArrowRight size={13} />
                </a>
                <Link
                  href="/examples"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.09] transition-colors"
                >
                  <FileCode2 size={13} className="text-zinc-400" />
                  <span>Reference Templates ({EXAMPLE_BLUEPRINTS.length})</span>
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <BookOpen size={13} />
                  <span>Documentation</span>
                </Link>
              </div>
            </div>

            {/* Right: Supported Output Artifacts Matrix */}
            <div className="lg:col-span-5 rounded-xl bg-[#0b0d12] border border-white/[0.08] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/[0.07] bg-[#090b0f] flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium text-zinc-300">
                  Supported Generation Targets
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  Click to configure
                </span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {SUPPORTED_ARTIFACTS.map((item) => {
                  const itemTheme = ARCHETYPE_THEMES[item.archetype];
                  return (
                    <Link
                      key={item.archetype}
                      href={`/?archetype=${item.archetype}#studio`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-zinc-900 border border-white/[0.08] flex items-center justify-center shrink-0">
                          <TechIcon
                            iconKey={`target-${item.archetype}`}
                            name={item.title}
                            size={15}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                              {item.title}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500 truncate">
                              {item.path}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {item.platforms}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        size={13}
                        className={`shrink-0 text-zinc-600 group-hover:translate-x-0.5 transition-all ${itemTheme.classes.starterTitleHover}`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Synthesis Studio */}
      <main id="studio" className="scroll-mt-16 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <Wizard />
      </main>

      {/* Workflow Architecture Section */}
      <section className="border-t border-white/[0.07] bg-[#07080b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                Studio Workflow
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                From repository structure to validated configuration files
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl">
                Each run indexes your stack, collects explicit infrastructure choices, generates
                modular code, and checks YAML or HCL syntax before opening the editor.
              </p>
            </div>
            <Link
              href="/docs#architecture"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 shrink-0"
            >
              <span>View architecture docs</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKFLOW_STEPS.map((stage) => {
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

      {/* Reference Blueprints Preview */}
      <section className="border-t border-white/[0.07] bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                Reference Templates
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Inspect or customize starter configurations
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl">
                Open pre-built GitHub Actions, Terraform, Kubernetes, and Docker Compose templates
                directly in the code editor or load them into the studio to adapt for your stack.
              </p>
            </div>
            <Link
              href="/examples"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.09] shrink-0"
            >
              <span>Browse all {EXAMPLE_BLUEPRINTS.length} templates</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {featuredBlueprints.map((bp) => {
              const bpTheme = ARCHETYPE_THEMES[bp.archetype];
              return (
                <div
                  key={bp.id}
                  className="p-5 rounded-xl bg-[#0d0f14] border border-white/[0.08] flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${bpTheme.classes.badge}`}
                      >
                        <TechIcon
                          iconKey={`target-${bp.archetype}`}
                          name={bpTheme.name}
                          size={12}
                        />
                        <span>
                          {bp.archetype} · {bp.targetPlatform}
                        </span>
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
                      className={`flex-1 text-center py-2 px-3 rounded-md text-xs font-semibold transition-colors ${bpTheme.classes.primaryBtn}`}
                    >
                      Open in Editor
                    </Link>
                    <Link
                      href={`/?blueprint=${bp.id}&mode=customize#studio`}
                      className="flex-1 text-center py-2 px-3 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.09] transition-colors"
                    >
                      Customize
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Multi-Provider Routing Table */}
      <section className="border-t border-white/[0.07] bg-[#07080b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Model Routing &amp; Fallbacks
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Multi-provider model chains across studio stages
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Run the default multi-model ensemble or pin a specific model in Step 1. If a provider
              rate-limits or times out, the router falls back to the next configured provider.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0d0f14]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#090b0f] font-mono text-[11px] uppercase text-zinc-400">
                  <th className="py-3 px-4">Studio Stage</th>
                  <th className="py-3 px-4">API Route</th>
                  <th className="py-3 px-4">Default Model</th>
                  <th className="py-3 px-4">Fallback 1</th>
                  <th className="py-3 px-4">Fallback 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {ROUTING_MATRIX.map((row) => (
                  <tr key={row.stage} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-100">{row.stage}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{row.endpoint}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] bg-zinc-900 text-zinc-200 border border-white/[0.08]">
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
