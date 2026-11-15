"use client";

import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useWizardStore, Archetype } from "@/store/useWizardStore";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import TechIcon from "@/components/ui/TechIcon";

const DIAGNOSTICS_BY_ARCHETYPE: Record<Archetype, string[]> = {
  pipeline: [
    "Indexing repository manifests, lockfiles, and build scripts",
    "Mapping OIDC cloud identity federation and container build layers",
    "Generating SAST, SBOM, and rollout interrogation matrix",
  ],
  terraform: [
    "Resolving target cloud provider topology and regional CIDR structure",
    "Evaluating remote state locking backends, KMS keys, and IAM scopes",
    "Generating HCL2 modular infrastructure trade-off matrix",
  ],
  kubernetes: [
    "Inspecting container ports, probes, and stateful storage dependencies",
    "Evaluating PodSecurity baselines, HPA scaling, and NetworkPolicies",
    "Generating cluster workload and ingress interrogation matrix",
  ],
  docker: [
    "Resolving multi-container runtimes, data stores, and exposed ports",
    "Mapping isolated bridge networks, named volumes, and healthcheck gates",
    "Generating Compose v2 runtime topology interrogation matrix",
  ],
};

export default function Step2Analyze() {
  const { status, repoUrl, archetype, targetPlatform, errorMessage, setStep } = useWizardStore();
  const theme = ARCHETYPE_THEMES[archetype];
  const diagnostics = DIAGNOSTICS_BY_ARCHETYPE[archetype];

  if (status === "error") {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4 text-center px-4">
        <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-semibold text-white">Specification Analysis Failed</h3>
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
      <div
        className={`w-full max-w-lg rounded-xl bg-[#090b0f] border p-6 space-y-5 ${theme.classes.draftPanelBorder}`}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.1] flex items-center justify-center">
              <TechIcon iconKey={`target-${archetype}`} name={theme.name} size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Analyzing {theme.name} Context
              </h3>
              <p className="font-mono text-[11px] text-zinc-400 truncate max-w-[290px]">
                {repoUrl || "Stack Specification"} · {targetPlatform}
              </p>
            </div>
          </div>
          <Loader2 size={16} className={`${theme.classes.spinner} animate-spin shrink-0`} />
        </div>

        <div className="space-y-3">
          {diagnostics.map((item, idx) => (
            <div
              key={item}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-900/50 border border-white/[0.05]"
            >
              {idx === 0 ? (
                <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <Loader2
                  size={15}
                  className={`${theme.classes.spinner} animate-spin mt-0.5 shrink-0`}
                />
              )}
              <span className="text-xs text-zinc-300 leading-snug">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] font-mono text-zinc-500 text-center">
          Querying stack analyzer (`qwen/qwen3.8-27b`) for deterministic {theme.shortLabel}{" "}
          constraints...
        </p>
      </div>
    </div>
  );
}
