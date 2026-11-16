"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWizardStore, Archetype } from "@/store/useWizardStore";
import { EXAMPLE_BLUEPRINTS } from "@/lib/examplesData";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import { getAIModelOption } from "@/lib/aiModels";
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
  { id: 3, code: "03", label: "Configure" },
  { id: 4, code: "04", label: "Output" },
] as const;

const variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
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
    <div className="w-full min-h-[700px] h-[760px] studio-panel rounded-xl relative overflow-hidden flex flex-col">
      <Suspense fallback={null}>
        <StudioUrlHydrator />
      </Suspense>

      {/* Clean Studio Top Bar */}
      <div className="shrink-0 px-4 sm:px-5 py-2.5 border-b border-white/[0.07] bg-[#09090b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {STEPS.map((s, idx) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : isDone
                        ? "text-zinc-300"
                        : "text-zinc-500"
                  }`}
                >
                  {isDone ? (
                    <Check size={12} className="text-zinc-300" />
                  ) : (
                    <span className="font-mono text-[10px] text-zinc-500">{s.code}</span>
                  )}
                  <span>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 ? (
                  <span className="text-zinc-700 font-mono text-xs">/</span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/90 border border-white/[0.06] font-mono text-[11px] text-zinc-400">
            <span>{theme.shortLabel}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-200">{targetPlatform}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-300">{activeModel.shortName}</span>
          </span>

          <button
            type="button"
            onClick={() => setHistoryOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              historyOpen
                ? "bg-white/[0.1] text-white border-white/[0.2]"
                : "bg-zinc-900/80 text-zinc-300 border-white/[0.07] hover:border-white/[0.15] hover:text-white"
            }`}
          >
            <Clock size={12} className="text-zinc-400" />
            <span>History</span>
            {savedRuns.length > 0 ? (
              <span className="font-mono text-[10px] text-zinc-400">({savedRuns.length})</span>
            ) : null}
          </button>

          {step > 1 ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/80 border border-white/[0.07] hover:border-white/[0.15] transition-colors"
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
        <div className="absolute inset-x-0 top-[45px] bottom-0 z-30 bg-[#09090b]/95 backdrop-blur-md p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div>
              <h3 className="text-sm font-semibold text-white">Saved Runs</h3>
              <p className="text-xs text-zinc-400">
                Recent configurations stored in your browser.
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
              <Clock size={20} className="text-zinc-600" />
              <p className="text-xs font-medium text-zinc-300">No saved runs yet</p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Generated files are saved here automatically for quick access.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {savedRuns.map((run) => {
                const runModel = getAIModelOption(run.modelId);
                return (
                  <div
                    key={run.id}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.07] hover:border-white/[0.15] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-100 truncate">
                          {run.title}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize">
                          {run.archetype} · {run.targetPlatform}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">
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
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white transition-colors"
                      >
                        Open
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
              className="h-full p-4 sm:p-5"
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
              className="h-full p-4 sm:p-5"
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
              className="h-full p-4 sm:p-5"
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
