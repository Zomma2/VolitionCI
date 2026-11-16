"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWizardStore, Archetype } from "@/store/useWizardStore";
import { EXAMPLE_BLUEPRINTS } from "@/lib/examplesData";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import { getAIModelOption } from "@/lib/aiModels";
import TechIcon from "@/components/ui/TechIcon";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, RotateCcw, Trash2, X } from "lucide-react";
import Step1Ingest from "./Step1Ingest";
import Step2Analyze from "./Step2Analyze";
import Step3Interrogate from "./Step3Interrogate";
import Step4Execution from "./Step4Execution";

const DEFAULT_PLATFORMS: Record<Archetype, string> = {
  pipeline: "GitHub Actions",
  terraform: "AWS",
  kubernetes: "Generic Kubernetes",
  docker: "Local Development",
};

const STEPS = [
  { id: 1, code: "01", label: "Ingest" },
  { id: 2, code: "02", label: "Analyze" },
  { id: 3, code: "03", label: "Interrogate" },
  { id: 4, code: "04", label: "Synthesize" },
] as const;

const variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function StudioUrlHydrator() {
  const searchParams = useSearchParams();
  const { setArchetype, setTargetPlatform, loadBlueprintIntoEditor, loadBlueprintIntoPrompt } =
    useWizardStore();

  useEffect(() => {
    const blueprintId = searchParams.get("blueprint");
    const mode = searchParams.get("mode");
    if (blueprintId) {
      const found = EXAMPLE_BLUEPRINTS.find((b) => b.id === blueprintId);
      if (found) {
        if (mode === "customize") {
          loadBlueprintIntoPrompt({
            archetype: found.archetype,
            targetPlatform: found.targetPlatform,
            prompt: found.starterPrompt,
          });
        } else {
          loadBlueprintIntoEditor({
            title: found.title,
            archetype: found.archetype,
            targetPlatform: found.targetPlatform,
            code: found.code,
          });
        }
        return;
      }
    }

    const arch = searchParams.get("archetype") as Archetype | null;
    if (arch && ["pipeline", "terraform", "kubernetes", "docker"].includes(arch)) {
      setArchetype(arch);
      setTargetPlatform(DEFAULT_PLATFORMS[arch]);
    }
  }, [searchParams, setArchetype, setTargetPlatform, loadBlueprintIntoEditor, loadBlueprintIntoPrompt]);

  return null;
}

export default function Wizard() {
  const {
    step,
    archetype,
    targetPlatform,
    selectedModel,
    savedRuns,
    hydrateHistory,
    loadBlueprintIntoEditor,
    deleteHistoryRun,
    reset,
  } = useWizardStore();
  const [historyOpen, setHistoryOpen] = useState(false);

  const theme = ARCHETYPE_THEMES[archetype];
  const activeModel = getAIModelOption(selectedModel);

  useEffect(() => {
    hydrateHistory();
  }, [hydrateHistory]);

  return (
    <div className="w-full min-h-[790px] h-[860px] studio-panel rounded-xl relative overflow-hidden flex flex-col">
      <Suspense fallback={null}>
        <StudioUrlHydrator />
      </Suspense>

      {/* Dynamic Per-Target Signature Top Accent Bar */}
      <div
        className={`h-[2px] w-full shrink-0 bg-gradient-to-r transition-all duration-300 ${theme.classes.topAccentBar}`}
      />

      {/* Studio Command & Stage Header */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-[#090b0f] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {STEPS.map((s, idx) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? theme.classes.stepActive
                      : isDone
                        ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/20"
                        : "text-zinc-500 border border-transparent"
                  }`}
                >
                  {isDone ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <span className="font-mono text-[10px] opacity-80">{s.code}</span>
                  )}
                  <span>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 ? (
                  <div className="w-3 sm:w-5 h-px bg-white/[0.08]" />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.08] font-mono text-[11px] text-zinc-200">
            <TechIcon iconKey={activeModel.iconKey} name={activeModel.name} size={13} />
            <span>{activeModel.shortName}</span>
          </span>

          <span
            className={`hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-md border font-mono text-[11px] transition-colors ${theme.classes.badge}`}
          >
            <TechIcon iconKey={`target-${archetype}`} name={theme.name} size={13} />
            <span className="font-semibold">{theme.shortLabel}</span>
            <span className="opacity-50">/</span>
            <span className="text-zinc-100">{targetPlatform}</span>
          </span>

          <button
            type="button"
            onClick={() => setHistoryOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              historyOpen
                ? "bg-white/[0.1] text-white border-white/[0.2]"
                : "bg-zinc-900 text-zinc-300 border-white/[0.08] hover:border-white/[0.16] hover:text-white"
            }`}
          >
            <Clock size={12} className="text-zinc-400" />
            <span>History</span>
            {savedRuns.length > 0 ? (
              <span className="font-mono text-[10px] px-1 rounded bg-white/[0.08] text-zinc-200">
                {savedRuns.length}
              </span>
            ) : null}
          </button>

          {step > 1 ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-white/[0.08] hover:border-white/[0.16] transition-colors"
              title="Reset studio session"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Saved Synthesis History Slide-Over */}
      {historyOpen ? (
        <div className="absolute inset-x-0 top-[51px] bottom-0 z-30 bg-[#090b0f]/95 backdrop-blur-md p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-semibold text-white">Local Synthesis History</h3>
              <p className="text-xs text-zinc-400">
                Completed runs stored in your browser for instant inspection or download.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHistoryOpen(false)}
              aria-label="Close history panel"
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            >
              <X size={16} />
            </button>
          </div>

          {savedRuns.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
              <Clock size={22} className="text-zinc-600" />
              <p className="text-xs font-medium text-zinc-300">No saved runs yet</p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Synthesize a CI/CD pipeline, Terraform module, Kubernetes manifest, or Docker
                Compose stack and it will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {savedRuns.map((run) => {
                const runTheme = ARCHETYPE_THEMES[run.archetype] || ARCHETYPE_THEMES.pipeline;
                const runModel = getAIModelOption(run.modelId);
                return (
                  <div
                    key={run.id}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-lg bg-zinc-900/70 border border-white/[0.08] hover:border-white/[0.16] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <TechIcon
                          iconKey={`target-${run.archetype}`}
                          name={runTheme.name}
                          size={14}
                        />
                        <span className="text-xs font-semibold text-zinc-100 truncate">
                          {run.title}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded border capitalize ${runTheme.classes.badge}`}
                        >
                          {run.archetype}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {run.targetPlatform}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/[0.06]">
                          {runModel.shortName}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-1">
                        {new Date(run.createdAt).toLocaleString()} · {run.code.split("\n").length}{" "}
                        lines
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          loadBlueprintIntoEditor({
                            title: run.title,
                            archetype: run.archetype,
                            targetPlatform: run.targetPlatform,
                            code: run.code,
                          });
                          setHistoryOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${runTheme.classes.primaryBtn}`}
                      >
                        Open in Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHistoryRun(run.id)}
                        aria-label={`Delete ${run.title}`}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Main Step Viewport */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full p-5 sm:p-6"
            >
              <Step1Ingest />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full p-5 sm:p-6"
            >
              <Step2Analyze />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full p-5 sm:p-6"
            >
              <Step3Interrogate />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <Step4Execution />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
