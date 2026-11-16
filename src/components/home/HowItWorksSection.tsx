"use client";

import Link from "next/link";
import TechIcon from "@/components/ui/TechIcon";
import {
  ArrowRight,
  Check,
  Cpu,
  FileCode2,
  GitBranch,
  KeyRound,
  Layers,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";

const FLOW_NODES = [
  {
    code: "01",
    label: "Ingest",
    sub: "GitHub Tree / Stack",
    icon: GitBranch,
  },
  {
    code: "02",
    label: "Interrogate",
    sub: "Security & State Policy",
    icon: SlidersHorizontal,
  },
  {
    code: "03",
    label: "Synthesize",
    sub: "Multi-Model Workers",
    icon: Cpu,
  },
  {
    code: "04",
    label: "Validate",
    sub: "YAML & HCL2 Gate",
    icon: ShieldCheck,
  },
  {
    code: "05",
    label: "Export",
    sub: "Monaco IDE Buffer",
    icon: FileCode2,
  },
];

const STACK_LOGOS = [
  { name: "GitHub", iconKey: "github" },
  { name: "Docker", iconKey: "docker" },
  { name: "Kubernetes", iconKey: "kubernetes" },
  { name: "Terraform", iconKey: "terraform" },
  { name: "Next.js", iconKey: "nextjs" },
  { name: "Go", iconKey: "go" },
  { name: "PostgreSQL", iconKey: "postgresql" },
  { name: "GitLab", iconKey: "gitlab" },
];

export default function HowItWorksSection() {
  return (
    <section className="border-t border-white/[0.07] bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              System Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
              How VolitionCI turns repository context into verified infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Instead of relying on a single unverified prompt, the studio runs a structured
              four-stage pipeline — combining repository indexing, policy selection, parallel code
              models, and syntax verification.
            </p>
          </div>
          <Link
            href="/docs#architecture"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors shrink-0"
          >
            <span>Read architecture specification</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* High-Level End-to-End Pipeline Schematic Bar */}
        <div className="rounded-xl bg-[#0c0d10] border border-white/[0.07] p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.05]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              End-to-End Execution Pipeline
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              Deterministic YAML &amp; HCL2 Gate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {FLOW_NODES.map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={node.code} className="relative flex items-center">
                  <div className="w-full p-3 rounded-lg bg-[#09090b] border border-white/[0.07] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-zinc-900 border border-white/[0.08] flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-zinc-200" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-zinc-500">{node.code}</span>
                        <span className="text-xs font-semibold text-zinc-100 truncate">
                          {node.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">{node.sub}</div>
                    </div>
                  </div>
                  {i < FLOW_NODES.length - 1 ? (
                    <div className="hidden sm:flex absolute -right-2 z-10 w-3 items-center justify-center text-zinc-600">
                      <ArrowRight size={11} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Card Visual Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 01: Repository & Stack Ingestion */}
          <div className="rounded-xl bg-[#0c0d10] border border-white/[0.07] overflow-hidden flex flex-col justify-between">
            {/* Visual Schematic Header */}
            <div className="p-5 bg-[#08090c] border-b border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Terminal size={11} className="text-zinc-400" />
                  <span>OCTOKIT TREE INDEXER // STACK GRAPH</span>
                </span>
                <span>STAGE 01</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-stretch">
                {/* Mini File Tree Window */}
                <div className="sm:col-span-6 p-3 rounded-lg bg-[#0c0d10] border border-white/[0.07] font-mono text-[11px] space-y-1.5">
                  <div className="text-[10px] text-zinc-500 pb-1 border-b border-white/[0.05]">
                    github.com/org/service-api
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>├─ Dockerfile</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                      detected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>├─ package.json</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                      detected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>└─ infra/main.tf</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500">
                      indexed
                    </span>
                  </div>
                </div>

                {/* Detected Stack Emblem Grid */}
                <div className="sm:col-span-6 p-3 rounded-lg bg-[#0c0d10] border border-white/[0.07] flex flex-col justify-between">
                  <div className="font-mono text-[10px] text-zinc-500">
                    Supported Runtimes &amp; Targets
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {STACK_LOGOS.map((logo) => (
                      <div
                        key={logo.name}
                        title={logo.name}
                        className="h-8 rounded bg-[#09090b] border border-white/[0.06] flex items-center justify-center"
                      >
                        <TechIcon iconKey={logo.iconKey} name={logo.name} size={15} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Copy */}
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-500">01</span>
                <h3 className="text-base font-semibold text-zinc-100">
                  Repository Tree &amp; Stack Discovery
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Point to a public GitHub URL to scan its recursive file tree via the GitHub REST
                API without cloning code to disk, describe your architecture in the 3-turn
                Architect Chat, or compose your stack from verified cloud and runtime components.
              </p>
            </div>
          </div>

          {/* Card 02: Context-Aware Policy Interrogation */}
          <div className="rounded-xl bg-[#0c0d10] border border-white/[0.07] overflow-hidden flex flex-col justify-between">
            {/* Visual Schematic Header */}
            <div className="p-5 bg-[#08090c] border-b border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <SlidersHorizontal size={11} className="text-zinc-400" />
                  <span>POLICY &amp; TOPOLOGY MATRIX</span>
                </span>
                <span>STAGE 02</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#0c0d10] border border-white/[0.14] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded bg-zinc-900 border border-white/[0.08] flex items-center justify-center shrink-0">
                      <KeyRound size={12} className="text-zinc-200" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-zinc-100 truncate">
                        AWS OIDC Federation (Role Assumption)
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 truncate">
                        Eliminates long-lived static cloud credentials
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.08] font-mono text-[10px] text-zinc-200 shrink-0">
                    <Check size={10} />
                    Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-[#0c0d10] border border-white/[0.07] flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Lock size={12} className="text-zinc-400 shrink-0" />
                      <span className="text-[11px] text-zinc-300 truncate">
                        S3 + Lock Backend
                      </span>
                    </div>
                    <Check size={11} className="text-zinc-400 shrink-0" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0c0d10] border border-white/[0.07] flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck size={12} className="text-zinc-400 shrink-0" />
                      <span className="text-[11px] text-zinc-300 truncate">
                        Trivy + Semgrep Gate
                      </span>
                    </div>
                    <Check size={11} className="text-zinc-400 shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Copy */}
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-500">02</span>
                <h3 className="text-base font-semibold text-zinc-100">
                  Targeted Infrastructure Interrogation
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Before generating code, the analyzer formulates 3 to 4 concrete architectural
                questions tailored to your target — resolving state locking, subnet isolation,
                `PodSecurity` baselines, HPA scaling, and container CVE gates upfront.
              </p>
            </div>
          </div>

          {/* Card 03: Parallel Multi-Model Synthesis */}
          <div className="rounded-xl bg-[#0c0d10] border border-white/[0.07] overflow-hidden flex flex-col justify-between">
            {/* Visual Schematic Header */}
            <div className="p-5 bg-[#08090c] border-b border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Layers size={11} className="text-zinc-400" />
                  <span>PARALLEL MULTI-MODEL ROUTER</span>
                </span>
                <span>STAGE 03</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <div className="p-2.5 rounded-lg bg-[#0c0d10] border border-white/[0.07] space-y-1">
                  <div className="font-mono text-[10px] text-zinc-500">01 · PLANNER</div>
                  <div className="text-xs font-semibold text-zinc-100">Cohere Command A</div>
                  <div className="font-mono text-[10px] text-zinc-400">Naming contract</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0c0d10] border border-white/[0.14] space-y-1">
                  <div className="font-mono text-[10px] text-zinc-400">02 · PARALLEL WORKERS</div>
                  <div className="text-xs font-semibold text-white">Codestral + Gemini 3.6</div>
                  <div className="font-mono text-[10px] text-zinc-400">Concurrent modules</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0c0d10] border border-white/[0.07] space-y-1">
                  <div className="font-mono text-[10px] text-zinc-500">03 · VERIFIER</div>
                  <div className="text-xs font-semibold text-zinc-100">Qwen 3.8 / GPT-OSS</div>
                  <div className="font-mono text-[10px] text-zinc-400">Completeness gate</div>
                </div>
              </div>
            </div>

            {/* Card Copy */}
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-500">03</span>
                <h3 className="text-base font-semibold text-zinc-100">
                  Parallel Multi-Model Code Synthesis
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Run the 4-provider ensemble or pin a specific engine (`Codestral`, `Gemini 3.6
                Flash`, `GPT-OSS 120B`, `Command A`, `Qwen 3.8`). Large Terraform and Kubernetes
                deployments are split into concurrent modules so outputs never truncate mid-file.
              </p>
            </div>
          </div>

          {/* Card 04: Syntax Verification & Monaco Export */}
          <div className="rounded-xl bg-[#0c0d10] border border-white/[0.07] overflow-hidden flex flex-col justify-between">
            {/* Visual Schematic Header */}
            <div className="p-5 bg-[#08090c] border-b border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={11} className="text-zinc-400" />
                  <span>AST &amp; STRUCTURAL VERIFICATION GATE</span>
                </span>
                <span>STAGE 04</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0c0d10] border border-white/[0.07] font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                  <span className="text-zinc-200">infra/main.tf · 184 lines</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] text-zinc-200">
                    HCL2 Validated
                  </span>
                </div>
                <div className="text-zinc-400 space-y-0.5 text-[10px]">
                  <div>
                    <span className="text-zinc-500">01</span> resource &quot;aws_vpc&quot;
                    &quot;main&quot; &#123; cidr_block = var.vpc_cidr &#125;
                  </div>
                  <div>
                    <span className="text-zinc-500">02</span> resource &quot;aws_eks_cluster&quot;
                    &quot;control_plane&quot; &#123; ... &#125;
                  </div>
                </div>
              </div>
            </div>

            {/* Card Copy */}
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-500">04</span>
                <h3 className="text-base font-semibold text-zinc-100">
                  Syntax Validation &amp; Side-by-Side Model Re-Runs
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every generated file is checked against multi-document YAML parsing (`js-yaml`),
                HCL2 block/brace balancing, or Jenkinsfile structure before loading into Monaco —
                where you can edit inline, download, or re-run with another model in one click.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
