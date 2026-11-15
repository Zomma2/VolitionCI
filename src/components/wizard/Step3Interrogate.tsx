"use client";

import { useState } from "react";
import { useWizardStore } from "@/store/useWizardStore";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import TechIcon from "@/components/ui/TechIcon";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckSquare,
} from "lucide-react";

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

  const theme = ARCHETYPE_THEMES[archetype];
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
      title: "DevSecOps Pipeline Interrogation",
      subtitle:
        "Select security gates, artifact signing, and deployment controls prior to workflow synthesis.",
    },
    terraform: {
      title: "Terraform State & Topology Parameters",
      subtitle:
        "Configure state locking backends, VPC subnet isolation, and KMS encryption posture.",
    },
    kubernetes: {
      title: "Kubernetes Workload & Policy Matrix",
      subtitle:
        "Define ingress controllers, HorizontalPodAutoscaler thresholds, and PodSecurity baselines.",
    },
    docker: {
      title: "Docker Compose Runtime Topology",
      subtitle:
        "Specify bridge network isolation, persistent volume mounts, and healthcheck gates.",
    },
  }[archetype];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 pb-3 border-b border-white/[0.07]">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2.5">
            <TechIcon iconKey={`target-${archetype}`} name={theme.name} size={19} />
            <span>{headerMeta.title}</span>
          </h2>
          <p className="text-xs text-zinc-400">{headerMeta.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-300">
            {answeredCount}/{agentQuestions.length} answered
          </span>
          {remainingCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                applyDefaultAnswers();
                setValidationNotice(false);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${theme.classes.outlineBtn}`}
            >
              <CheckSquare size={12} />
              <span>Select Recommended</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1.5 space-y-5 min-h-0 pb-4">
        {detectedStack ? (
          <div className="p-3.5 rounded-lg bg-[#090b0f] border border-white/[0.07] space-y-2">
            <h3 className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
              Detected Stack &amp; Target Context ({targetPlatform})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {detectedStack.languages?.map((l: string) => (
                <span
                  key={l}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] border ${theme.classes.badge}`}
                >
                  <TechIcon name={l} size={11} />
                  <span>{l}</span>
                </span>
              ))}
              {detectedStack.packageManagers?.map((p: string) => (
                <span
                  key={p}
                  className="px-2 py-0.5 rounded font-mono text-[11px] bg-zinc-800 text-zinc-300 border border-white/[0.08]"
                >
                  {p}
                </span>
              ))}
              {detectedStack.hasDockerfile ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <TechIcon iconKey="docker" name="Dockerfile" size={11} />
                  <span>Dockerfile Detected</span>
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-5">
          {agentQuestions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-4 rounded-lg bg-zinc-900/35 border border-white/[0.06] space-y-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Q{qIdx + 1}
                  </span>
                  {q.category ? (
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider ${theme.classes.iconActive}`}
                    >
                      {q.category}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs font-semibold text-zinc-100 pt-1">{q.question}</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{q.rationale}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      className={`relative p-3 rounded-lg border flex items-center gap-3 text-left transition-all ${
                        isSelected
                          ? theme.classes.techCardActive
                          : "bg-[#090b0f]/70 border-white/[0.07] text-zinc-300 hover:bg-zinc-900 hover:border-white/[0.15]"
                      }`}
                    >
                      {isSelected ? (
                        <div
                          className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center ${theme.classes.dot}`}
                        >
                          <Check size={10} className="text-zinc-950 stroke-[2.5]" />
                        </div>
                      ) : optIdx === 0 ? (
                        <span className="absolute top-2 right-2 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                          Recommended
                        </span>
                      ) : null}

                      <div className="shrink-0 w-8 h-8 rounded-md bg-zinc-900 border border-white/[0.08] flex items-center justify-center">
                        <TechIcon name={opt} size={17} />
                      </div>

                      <span className="text-xs font-medium leading-snug pr-6">{opt}</span>
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
              Please answer {remainingCount} remaining{" "}
              {remainingCount === 1 ? "question" : "questions"} or apply recommended defaults.
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
            Fill defaults
          </button>
        </div>
      ) : null}

      <div className="pt-3 border-t border-white/[0.08] flex gap-3 shrink-0">
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
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs transition-colors ${theme.classes.primaryBtn}`}
        >
          <span>
            Synthesize{" "}
            {archetype === "terraform"
              ? "Terraform Modules"
              : archetype === "kubernetes"
                ? "Kubernetes Manifests"
                : archetype === "docker"
                  ? "Docker Compose"
                  : "CI/CD Pipeline"}
          </span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
