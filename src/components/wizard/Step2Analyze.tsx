"use client";

import { Cpu, AlertTriangle } from "lucide-react";
import { useWizardStore } from "@/store/useWizardStore";

export default function Step2Analyze() {
  const { status, errorMessage, setStep } = useWizardStore();

  if (status === "error") {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">Analysis Failed</h3>
          <p className="text-sm text-white/50">{errorMessage}</p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center space-y-6 text-center animate-pulse">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-violet-600/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-600/40 to-indigo-600/40 border border-violet-500/30 flex items-center justify-center backdrop-blur-sm">
          <Cpu size={24} className="text-violet-300" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">Analyzing Repository</h3>
        <p className="text-sm text-white/50 max-w-sm leading-relaxed">
          Agent parsing repository and mapping DevSecOps requirements...
        </p>
      </div>
    </div>
  );
}

