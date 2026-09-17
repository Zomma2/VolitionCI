"use client";

import { useState, useTransition } from "react";
import GeneratorForm from "@/components/GeneratorForm";
import OutputPane from "@/components/OutputPane";
import type { PipelineFormData, OutputType } from "@/types/pipeline";
import type { GenerationState } from "@/types/pipeline";
import type { GenerateResponse, GenerateError } from "@/app/api/generate/route";
import { Cpu, Sparkles, Zap } from "lucide-react";

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [genState, setGenState] = useState<GenerationState>({
    status: "idle",
    output: "",
    errorMessage: "",
  });
  const [currentOutputType, setCurrentOutputType] = useState<OutputType>("ci-pipeline");

  const isLoading =
    isPending ||
    genState.status === "queued" ||
    genState.status === "generating";

  async function handleGenerate(data: PipelineFormData) {
    setGenState({ status: "queued", output: "", errorMessage: "" });
    setCurrentOutputType(data.outputType);

    startTransition(async () => {
      setGenState({ status: "generating", output: "", errorMessage: "" });

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = (await res.json()) as GenerateResponse | GenerateError;

        if (!res.ok) {
          setGenState({
            status: "error",
            output: "",
            errorMessage:
              (json as GenerateError).error ?? `Server error ${res.status}. Please try again.`,
          });
          return;
        }

        setGenState({
          status: "success",
          output: (json as GenerateResponse).output,
          errorMessage: "",
        });
      } catch {
        setGenState({
          status: "error",
          output: "",
          errorMessage: "Network error — could not reach the server.",
        });
      }
    });
  }

  return (
    <div
      className="min-h-screen text-white flex flex-col relative overflow-hidden animated-gradient"
    >
      {/* ── Ambient orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse, #a78bfa 0%, transparent 60%)" }}
        />
      </div>

      {/* ── Nav ── */}
      <header className="flex-shrink-0 relative z-10">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: "0 0 20px rgb(124 58 237 / 0.5)",
                }}
              >
                <Cpu size={14} className="text-white" />
              </div>
              <span className="font-bold text-[15px] tracking-tight">
                Volition<span className="text-violet-400">CI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                BETA
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {["Docs", "Examples", "Changelog"].map((item) => (
                <a key={item} href="#" className="text-xs font-medium text-white/30 hover:text-white/70 transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/30">
                <Zap size={11} className="text-violet-400" />
                <span>Groq · GPT OSS 120B</span>
              </div>
              <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.14] transition-all">
                GitHub ↗
              </button>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      </header>

      {/* ── Hero ── */}
      <div className="flex-shrink-0 relative z-10 pt-16 pb-12 text-center px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/8 border border-violet-500/15 mb-6">
          <Sparkles size={11} className="text-violet-400" />
          <span className="text-xs font-medium text-violet-300/80">
            AI-Powered DevOps Automation
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
          Generate{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)",
            }}
          >
            CI/CD Pipelines
          </span>
          <br />
          in Seconds
        </h1>

        <p className="mt-5 text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Describe your architecture. Get production-ready GitHub Actions,
          GitLab CI, Dockerfiles, and proxy configurations — no boilerplate.
        </p>

        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          {[
            { label: "GitHub Actions", dot: "#238636" },
            { label: "GitLab CI", dot: "#e24329" },
            { label: "Bitbucket", dot: "#0052cc" },
            { label: "CircleCI", dot: "#343434" },
            { label: "Jenkins", dot: "#d33833" },
          ].map(({ label, dot }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white/40 bg-white/[0.03] border border-white/[0.05]"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main two-pane ── */}
      <main className="flex-1 relative z-10 max-w-screen-xl mx-auto w-full px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 min-h-[680px]">
          <div className="glass rounded-2xl p-6 flex flex-col overflow-y-auto glow-violet-sm">
            <GeneratorForm onSubmit={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="glass rounded-2xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-0 glow-violet-sm">
            <OutputPane state={genState} outputType={currentOutputType} />
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="flex-shrink-0 relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[11px] text-white/20">
            VolitionCI &copy; {new Date().getFullYear()}
          </span>
          <span className="text-[11px] text-white/20">
            Next.js · Groq · Monaco Editor · Tailwind CSS
          </span>
        </div>
      </footer>
    </div>
  );
}
