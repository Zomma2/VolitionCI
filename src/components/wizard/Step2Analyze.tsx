"use client";

import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useWizardStore, Archetype } from "@/store/useWizardStore";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import { getAIModelOption } from "@/lib/aiModels";

const DIAGNOSTICS_BY_ARCHETYPE: Record<Archetype, string[]> = {
  pipeline: [
    "Indexing repository manifests, lockfiles, and build scripts",
    "Mapping cloud identity federation and container build layers",
    "Preparing pipeline configuration options",
  ],
  terraform: [
    "Resolving target cloud provider topology and network layout",
    "Evaluating remote state backends, encryption keys, and IAM scopes",
    "Preparing Terraform infrastructure options",
  ],
  kubernetes: [
    "Inspecting container ports, probes, and storage dependencies",
    "Evaluating PodSecurity baselines, autoscaling, and network policies",
    "Preparing Kubernetes workload options",
  ],
  docker: [
    "Resolving container runtimes, data stores, and exposed ports",
    "Mapping bridge networks, volumes, and healthcheck gates",
    "Preparing Docker Compose options",
  ],
};

export default function Step2Analyze() {
  const {
    status,
    repoUrl,
    archetype,
    targetPlatform,
    selectedModel,
    errorMessage,
    setStep,
  } = useWizardStore();
  const theme = ARCHETYPE_THEMES[archetype];
  const diagnostics = DIAGNOSTICS_BY_ARCHETYPE[archetype];
  const activeModel = getAIModelOption(selectedModel);

  if (status === "error") {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4 text-center px-4">
        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center">
          <AlertTriangle size={18} className="text-red-400" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-sm font-semibold text-white">Analysis Failed</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {errorMessage ||
              "Unable to inspect the target repository. Ensure the repository is public or verify your GitHub URL."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.1] transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-xl bg-[#09090b] border border-white/[0.08] p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-zinc-100">
              Analyzing {theme.name} Specification
            </h3>
            <p className="font-mono text-[11px] text-zinc-400 truncate max-w-[320px]">
              {repoUrl || "Stack Specification"} · {targetPlatform}
            </p>
          </div>
          <Loader2 size={15} className="text-zinc-300 animate-spin shrink-0" />
        </div>

        <div className="space-y-2.5">
          {diagnostics.map((item, idx) => (
            <div
              key={item}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900/40 border border-white/[0.05]"
            >
              {idx === 0 ? (
                <CheckCircle2 size={14} className="text-zinc-300 mt-0.5 shrink-0" />
              ) : (
                <Loader2 size={14} className="text-zinc-400 animate-spin mt-0.5 shrink-0" />
              )}
              <span className="text-xs text-zinc-300 leading-snug">{item}</span>
            </div>
          ))}
        </div>

        <div className="text-center font-mono text-[11px] text-zinc-500">
          Model: {activeModel.name} ({activeModel.provider})
        </div>
      </div>
    </div>
  );
}
