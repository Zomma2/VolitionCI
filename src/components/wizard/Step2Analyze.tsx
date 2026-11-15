"use client";

import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Terminal } from "lucide-react";
import { useWizardStore } from "@/store/useWizardStore";

const DIAGNOSTIC_STEPS = [
  "Resolving target topology and repository manifest index",
  "Evaluating runtime dependencies, container layers, and state requirements",
  "Generating architectural trade-off and security interrogation matrix",
];

export default function Step2Analyze() {
  const { status, repoUrl, archetype, targetPlatform, errorMessage, setStep } = useWizardStore();

  if (status === "error") {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4 text-center px-4">
        <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-semibold text-white">Repository Analysis Failed</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {errorMessage ||
              "Unable to inspect the target repository. Ensure the repository is public or verify your GitHub URL."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.1] transition-colors"
        >
          <ArrowLeft size={13} />
          Return to Setup
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-xl bg-[#090b0f] border border-white/[0.08] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center">
              <Terminal size={16} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Context Analysis in Progress</h3>
              <p className="font-mono text-[11px] text-zinc-400 truncate max-w-[280px]">
                {repoUrl || "Stack Specification"} · {archetype} ({targetPlatform})
              </p>
            </div>
          </div>
          <Loader2 size={16} className="text-cyan-400 animate-spin shrink-0" />
        </div>

        <div className="space-y-3">
          {DIAGNOSTIC_STEPS.map((item, idx) => (
            <div
              key={item}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-900/50 border border-white/[0.05]"
            >
              {idx === 0 ? (
                <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <Loader2 size={15} className="text-cyan-400 animate-spin mt-0.5 shrink-0" />
              )}
              <span className="text-xs text-zinc-300 leading-snug">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] font-mono text-zinc-500 text-center">
          Querying stack analyzer (`qwen/qwen3.8-27b`) for deterministic architectural constraints...
        </p>
      </div>
    </div>
  );
}
