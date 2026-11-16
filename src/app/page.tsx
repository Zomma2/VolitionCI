import Link from "next/link";
import Wizard from "@/components/wizard/Wizard";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import { EXAMPLE_BLUEPRINTS } from "@/lib/examplesData";
import { ArrowRight } from "lucide-react";

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
    primary: "Groq Qwen 3.8 27B",
    fallback1: "Groq GPT-OSS 120B",
    fallback2: "Mistral Codestral",
  },
];

export default function Home() {
  const featuredBlueprints = EXAMPLE_BLUEPRINTS.slice(0, 3);

  return (
    <div className="bg-grid-surface">
      {/* Compact Editorial Product Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
              Infrastructure &amp; CI/CD Configuration Studio
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Generate and validate GitHub Actions, GitLab CI, Jenkinsfiles, Terraform HCL,
              Kubernetes manifests, and Docker Compose files across multiple code models.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/examples"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors"
            >
              <span>Reference Templates ({EXAMPLE_BLUEPRINTS.length})</span>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <span>Documentation</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Studio Workspace */}
      <main id="studio" className="scroll-mt-16 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-14">
        <Wizard />
      </main>

      {/* Visual How It Works Architecture Section */}
      <HowItWorksSection />

      {/* Reference Templates */}
      <section className="border-t border-white/[0.07] bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                Templates
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                Starter configurations
              </h2>
            </div>
            <Link
              href="/examples"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white shrink-0"
            >
              <span>View all {EXAMPLE_BLUEPRINTS.length} templates</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {featuredBlueprints.map((bp) => (
              <div
                key={bp.id}
                className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.07] flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="text-zinc-300 uppercase">
                      {bp.archetype} · {bp.targetPlatform}
                    </span>
                    <span className="text-zinc-500">{bp.filePath}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100">{bp.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{bp.summary}</p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
                  <Link
                    href={`/?blueprint=${bp.id}#studio`}
                    className="flex-1 text-center py-2 px-3 rounded-md text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white transition-colors"
                  >
                    Open in Editor
                  </Link>
                  <Link
                    href={`/?blueprint=${bp.id}&mode=customize#studio`}
                    className="flex-1 text-center py-2 px-3 rounded-md text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors"
                  >
                    Customize
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Routing Table */}
      <section className="border-t border-white/[0.07] bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-6">
          <div className="space-y-1.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              Models
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
              Provider routing &amp; fallback chains
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.07] bg-[#0c0d10]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#09090b] font-mono text-[11px] uppercase text-zinc-500">
                  <th className="py-3 px-4 font-medium">Stage</th>
                  <th className="py-3 px-4 font-medium">Endpoint</th>
                  <th className="py-3 px-4 font-medium">Default</th>
                  <th className="py-3 px-4 font-medium">Fallback 1</th>
                  <th className="py-3 px-4 font-medium">Fallback 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {ROUTING_MATRIX.map((row) => (
                  <tr key={row.stage} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-200">{row.stage}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{row.endpoint}</td>
                    <td className="py-3 px-4 font-mono text-zinc-100">{row.primary}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{row.fallback1}</td>
                    <td className="py-3 px-4 font-mono text-zinc-500">{row.fallback2}</td>
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
