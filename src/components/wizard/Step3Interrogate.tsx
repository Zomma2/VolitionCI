"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function Step3Interrogate() {
  const {
    archetype,
    targetPlatform,
    detectedStack,
    agentQuestions,
    userAnswers,
    setAnswer,
    applyDefaultAnswers,
    setStep,
    setStatus,
  } = useWizardStore();
  const [validationNotice, setValidationNotice] = useState(false);

  const answeredCount = agentQuestions.filter((q) => Boolean(userAnswers[q.id])).length;
  const remainingCount = Math.max(0, agentQuestions.length - answeredCount);

  const handleSynthesize = () => {
    if (remainingCount > 0) {
      setValidationNotice(true);
      return;
    }
    setValidationNotice(false);
    setStep(4);
    setStatus("synthesizing");
  };

  const headerMeta = {
    pipeline: {
      title: "Pipeline Configuration",
      subtitle:
        "Select security gates, artifact signing, and deployment controls prior to generation.",
    },
    terraform: {
      title: "Terraform State & Topology",
      subtitle:
        "Configure state locking backends, VPC subnet layout, and encryption settings.",
    },
    kubernetes: {
      title: "Kubernetes Workload Policy",
      subtitle:
        "Define ingress controllers, autoscaling thresholds, and PodSecurity baselines.",
    },
    docker: {
      title: "Compose Runtime Topology",
      subtitle:
        "Specify bridge network isolation, persistent volumes, and healthcheck gates.",
    },
  }[archetype];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 pb-3 border-b border-white/[0.07]">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-white tracking-tight">
            {headerMeta.title}
          </h2>
          <p className="text-xs text-zinc-400">{headerMeta.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-zinc-900 border border-white/[0.07] text-zinc-400">
            {answeredCount}/{agentQuestions.length} selected
          </span>
          {remainingCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                applyDefaultAnswers();
                setValidationNotice(false);
              }}
              className="px-2.5 py-1 rounded text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.12] transition-colors"
            >
              Use Defaults
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 min-h-0 pb-4">
        {detectedStack ? (
          <div className="p-3 rounded-lg bg-[#09090b] border border-white/[0.07] flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mr-1">
              Stack ({targetPlatform}):
            </span>
            {detectedStack.languages?.map((l: string) => (
              <span
                key={l}
                className="px-2 py-0.5 rounded font-mono text-[11px] bg-zinc-900 text-zinc-300 border border-white/[0.07]"
              >
                {l}
              </span>
            ))}
            {detectedStack.packageManagers?.map((p: string) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded font-mono text-[11px] bg-zinc-900 text-zinc-400 border border-white/[0.07]"
              >
                {p}
              </span>
            ))}
          </div>
        ) : null}

        <div className="space-y-4">
          {agentQuestions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-4 rounded-lg bg-[#09090b] border border-white/[0.07] space-y-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase">
                  <span>0{qIdx + 1}</span>
                  {q.category ? <span>· {q.category}</span> : null}
                </div>
                <p className="text-xs font-semibold text-zinc-100 pt-0.5">{q.question}</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{q.rationale}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[q.id] === opt;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setAnswer(q.id, opt);
                        setValidationNotice(false);
                      }}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-left transition-all ${
                        isSelected
                          ? "bg-white/[0.08] border-white/[0.24] text-white"
                          : "bg-zinc-900/40 border-white/[0.07] text-zinc-300 hover:bg-zinc-900 hover:border-white/[0.15]"
                      }`}
                    >
                      <span className="text-xs font-medium leading-snug">{opt}</span>
                      {isSelected ? (
                        <Check size={13} className="text-zinc-100 shrink-0" />
                      ) : optIdx === 0 ? (
                        <span className="font-mono text-[9px] uppercase text-zinc-500 shrink-0">
                          Default
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {validationNotice && remainingCount > 0 ? (
        <div className="mb-3 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>
              Select {remainingCount} remaining{" "}
              {remainingCount === 1 ? "option" : "options"} or use defaults.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              applyDefaultAnswers();
              setValidationNotice(false);
            }}
            className="font-semibold underline hover:text-amber-200 shrink-0"
          >
            Use defaults
          </button>
        </div>
      ) : null}

      <div className="pt-3 border-t border-white/[0.07] flex gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <button
          type="button"
          onClick={handleSynthesize}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs text-zinc-950 bg-zinc-100 hover:bg-white transition-colors"
        >
          <span>
            Generate{" "}
            {archetype === "terraform"
              ? "Terraform Configuration"
              : archetype === "kubernetes"
                ? "Kubernetes Manifests"
                : archetype === "docker"
                  ? "Docker Compose"
                  : "CI/CD Workflow"}
          </span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
