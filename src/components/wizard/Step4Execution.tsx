"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useWizardStore } from "@/store/useWizardStore";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import { AI_MODEL_OPTIONS, ModelSelectionId, getAIModelOption } from "@/lib/aiModels";
import TechIcon from "@/components/ui/TechIcon";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCheck,
  CheckCircle2,
  Copy,
  Cpu,
  Download,
  Loader2,
  Lock,
  Pencil,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#0d0f14] font-mono text-zinc-500 text-xs">
      Initializing Monaco code editor...
    </div>
  ),
});

function resolveArtifactMeta(archetype: string, provider: string) {
  if (archetype === "terraform") {
    return {
      fileName: "main.tf",
      filePath: "infra/main.tf",
      language: "hcl",
      badge: "HCL2 Verified",
    };
  }
  if (archetype === "kubernetes") {
    return {
      fileName: "k8s-manifests.yaml",
      filePath: "k8s/manifests.yaml",
      language: "yaml",
      badge: "Manifests Verified",
    };
  }
  if (archetype === "docker") {
    return {
      fileName: "docker-compose.yml",
      filePath: "docker-compose.yml",
      language: "yaml",
      badge: "Compose Verified",
    };
  }
  if (provider === "GitLab CI") {
    return {
      fileName: ".gitlab-ci.yml",
      filePath: ".gitlab-ci.yml",
      language: "yaml",
      badge: "GitLab YAML Verified",
    };
  }
  if (provider === "Bitbucket Pipelines") {
    return {
      fileName: "bitbucket-pipelines.yml",
      filePath: "bitbucket-pipelines.yml",
      language: "yaml",
      badge: "Pipelines Verified",
    };
  }
  if (provider === "CircleCI") {
    return {
      fileName: "config.yml",
      filePath: ".circleci/config.yml",
      language: "yaml",
      badge: "CircleCI Verified",
    };
  }
  if (provider === "Jenkins") {
    return {
      fileName: "Jenkinsfile",
      filePath: "Jenkinsfile",
      language: "groovy",
      badge: "Jenkinsfile Verified",
    };
  }
  return {
    fileName: "pipeline.yml",
    filePath: ".github/workflows/pipeline.yml",
    language: "yaml",
    badge: "YAML Verified",
  };
}

export default function Step4Execution() {
  const {
    archetype,
    status,
    repoUrl,
    repoContext,
    userAnswers,
    targetPlatform,
    selectedModel,
    ciProvider,
    generatedCode,
    errorMessage,
    setSelectedModel,
    setStatus,
    setGeneratedCode,
    saveRunToHistory,
    setStep,
    reset,
  } = useWizardStore();

  const [copied, setCopied] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [usageLog, setUsageLog] = useState<
    { model: string; provider?: string; role: string; usage: any }[]
  >([]);
  const [currentModule, setCurrentModule] = useState("");
  const [moduleProgress, setModuleProgress] = useState({ current: 0, total: 0 });
  const [synthTrigger, setSynthTrigger] = useState(0);
  const isRunningRef = useRef(false);

  const theme = ARCHETYPE_THEMES[archetype];
  const activePlatform = targetPlatform || ciProvider;
  const meta = resolveArtifactMeta(archetype, activePlatform);
  const activeModelMeta = getAIModelOption(selectedModel);

  useEffect(() => {
    if (status !== "synthesizing" || isRunningRef.current) return;

    isRunningRef.current = true;
    let isSubscribed = true;

    const startSynthesis = async () => {
      setUsageLog([]);
      setAttempt(0);
      setCurrentModule("");
      setModuleProgress({ current: 0, total: 0 });

      try {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoContext:
              repoContext ||
              `Target Archetype: ${archetype}\nTarget Platform: ${activePlatform}`,
            userAnswers,
            provider: activePlatform,
            archetype,
            selectedModel,
          }),
        });

        if (!res.ok || !res.body) {
          setStatus("error", `Synthesis server responded with HTTP ${res.status}`);
          isRunningRef.current = false;
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = "";

        while (!done && isSubscribed) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });

            let boundary = buffer.indexOf("\n\n");
            while (boundary !== -1) {
              const ev = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary + 2);
              boundary = buffer.indexOf("\n\n");

              if (!ev.trim()) continue;

              try {
                if (ev.startsWith("event: status")) {
                  const dataStr = ev.split("\ndata: ")[1];
                  if (dataStr) {
                    const parsed = JSON.parse(dataStr);
                    setStatus(parsed.step);
                    if (parsed.attempt) setAttempt(parsed.attempt);
                    if (parsed.module) setCurrentModule(parsed.module);
                    if (parsed.current) {
                      setModuleProgress({ current: parsed.current, total: parsed.total });
                    }
                  }
                } else if (ev.startsWith("event: usage")) {
                  const dataStr = ev.split("\ndata: ")[1];
                  if (dataStr) {
                    const parsed = JSON.parse(dataStr);
                    setUsageLog((prev) => [...prev, parsed]);
                  }
                } else if (ev.startsWith("event: complete")) {
                  const dataStr = ev.split("\ndata: ")[1];
                  if (dataStr) {
                    const parsed = JSON.parse(dataStr);
                    setGeneratedCode(parsed.code);
                    setStatus("complete", parsed.warning || "");
                    saveRunToHistory({
                      title: repoUrl || `${activePlatform} ${archetype}`,
                      archetype,
                      targetPlatform: activePlatform,
                      modelId: selectedModel,
                      code: parsed.code,
                    });
                  }
                } else if (ev.startsWith("event: error")) {
                  const dataStr = ev.split("\ndata: ")[1];
                  if (dataStr) {
                    const parsed = JSON.parse(dataStr);
                    setStatus("error", parsed.message);
                  }
                }
              } catch (parseError) {
                console.error("SSE Parse Error:", parseError);
              }
            }
          }
        }
      } catch {
        if (isSubscribed) setStatus("error", "Network stream interrupted during synthesis.");
      } finally {
        isRunningRef.current = false;
      }
    };

    startSynthesis();

    return () => {
      isSubscribed = false;
      isRunningRef.current = false;
    };
  }, [synthTrigger, status === "synthesizing"]);

  const handleRerunWithModel = (nextModel: ModelSelectionId) => {
    setSelectedModel(nextModel);
    setStatus("synthesizing", "");
    setSynthTrigger((prev) => prev + 1);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = meta.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (status === "error") {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4 text-center p-6">
        <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-base font-semibold text-white">Synthesis Pipeline Halted</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">{errorMessage}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.1] transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Interrogation
          </button>
          <button
            type="button"
            onClick={() => handleRerunWithModel("multi-agent")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-colors ${theme.classes.primaryBtn}`}
          >
            <RefreshCw size={13} />
            Retry with Multi-Model Ensemble
          </button>
        </div>
      </div>
    );
  }

  if (status !== "complete") {
    const isHealing = status === "self_healing";
    const phaseIndex =
      status === "planning" || status === "synthesizing"
        ? 1
        : status === "synthesizing_module" || status === "validating" || status === "self_healing"
          ? 2
          : status === "semantic_validation"
            ? 3
            : 1;

    const phases = [
      { id: 1, label: `Phase 1 · ${theme.shortLabel} Architecture Blueprint Planner` },
      {
        id: 2,
        label:
          moduleProgress.total > 1
            ? `Phase 2 · Multi-Model Worker & Syntax Gate (${moduleProgress.current}/${moduleProgress.total}: ${currentModule})`
            : `Phase 2 · Complete ${theme.shortLabel} Synthesis & Syntax Gate`,
      },
      { id: 3, label: "Phase 3 · Semantic Completeness Verification & Enrichment" },
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div
          className={`w-full max-w-xl rounded-xl bg-[#090b0f] border p-6 space-y-5 ${theme.classes.draftPanelBorder}`}
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.1] flex items-center justify-center">
                <TechIcon iconKey={activeModelMeta.iconKey} name={activeModelMeta.name} size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white">
                  {activeModelMeta.name} · {theme.shortLabel} Synthesis
                </h3>
                <p className="font-mono text-[11px] text-zinc-400">
                  {isHealing
                    ? `Self-healing remediation pass (${currentModule || `Attempt ${attempt}`})`
                    : `Target: ${meta.filePath} (${activePlatform})`}
                </p>
              </div>
            </div>
            {isHealing ? (
              <span className="px-2.5 py-1 rounded font-mono text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/25">
                REFINING
              </span>
            ) : (
              <Loader2 size={16} className={`${theme.classes.spinner} animate-spin`} />
            )}
          </div>

          <div className="space-y-2.5">
            {phases.map((p) => {
              const done = phaseIndex > p.id;
              const active = phaseIndex === p.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                    active
                      ? theme.classes.techCardActive
                      : done
                        ? "bg-emerald-500/[0.05] border-emerald-500/20 text-zinc-300"
                        : "bg-zinc-900/40 border-white/[0.05] text-zinc-500"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {done ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : active ? (
                      <Loader2
                        size={14}
                        className={`${theme.classes.spinner} animate-spin shrink-0`}
                      />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span className="font-medium">{p.label}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase">
                    {done ? "Pass" : active ? "Running" : "Queued"}
                  </span>
                </div>
              );
            })}
          </div>

          {usageLog.length > 0 ? (
            <div className="pt-2 border-t border-white/[0.06] space-y-1.5 max-h-36 overflow-y-auto">
              <div className="font-mono text-[10px] text-zinc-500 uppercase">
                Live Multi-Model Execution Telemetry
              </div>
              {usageLog.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between font-mono text-[11px] text-zinc-400"
                >
                  <span className="truncate">
                    {log.role} · <span className="text-zinc-200">{log.model}</span>
                  </span>
                  <span className={`${theme.classes.draftTitle} shrink-0`}>
                    {log.usage.total_tokens} tok
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const lineCount = generatedCode ? generatedCode.split("\n").length : 0;
  const byteSize = new Blob([generatedCode]).size;
  const uniqueModelsUsed = Array.from(new Set(usageLog.map((u) => u.model)));

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Editor Primary Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-white/[0.08] bg-[#090b0f] shrink-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <TechIcon iconKey={`target-${archetype}`} name={theme.name} size={15} />
          <span className="font-mono text-xs text-zinc-200 truncate">{meta.filePath}</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {meta.badge}
          </span>
          <span className="hidden md:inline font-mono text-[11px] text-zinc-400">
            {lineCount} lines · {(byteSize / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditable((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              isEditable
                ? theme.classes.platformActive
                : "bg-zinc-900 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
            }`}
            title={isEditable ? "Lock editor" : "Enable inline editing"}
          >
            {isEditable ? <Pencil size={12} /> : <Lock size={12} />}
            <span>{isEditable ? "Editing" : "Read-Only"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-200 transition-colors"
          >
            {copied ? (
              <CheckCheck size={12} className="text-emerald-400" />
            ) : (
              <Copy size={12} />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${theme.classes.primaryBtn}`}
          >
            <Download size={12} />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">New Build</span>
          </button>
        </div>
      </div>

      {/* 1-Click Model Comparison / Re-Synthesize Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 border-b border-white/[0.06] bg-[#0b0d12] shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400 uppercase tracking-wider mr-1">
            <Cpu size={11} className={theme.classes.iconActive} />
            <span>Re-synthesize with:</span>
          </span>
          {AI_MODEL_OPTIONS.map((m) => {
            const isActive = selectedModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleRerunWithModel(m.id)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  isActive
                    ? theme.classes.badge
                    : "bg-zinc-900/70 border-white/[0.06] text-zinc-400 hover:text-zinc-100 hover:border-white/[0.15]"
                }`}
                title={`Re-run synthesis using ${m.name}`}
              >
                <TechIcon iconKey={m.iconKey} name={m.name} size={11} />
                <span>{m.shortName}</span>
              </button>
            );
          })}
        </div>

        {uniqueModelsUsed.length > 0 ? (
          <span className="font-mono text-[10px] text-zinc-400">
            Active run engines: <span className="text-zinc-200">{uniqueModelsUsed.join(" + ")}</span>
          </span>
        ) : null}
      </div>

      {/* Monaco Viewport */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {errorMessage ? (
          <div className="shrink-0 bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle size={13} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="flex-1 min-h-0">
          <MonacoEditor
            height="100%"
            language={
              meta.language === "hcl"
                ? "hcl"
                : meta.language === "groovy"
                  ? "shell"
                  : "yaml"
            }
            value={generatedCode}
            onChange={(val) => {
              if (isEditable && typeof val === "string") {
                setGeneratedCode(val);
              }
            }}
            theme="vs-dark"
            options={{
              readOnly: !isEditable,
              minimap: { enabled: true },
              fontSize: 12.5,
              fontFamily: "var(--font-geist-mono), 'JetBrains Mono', monospace",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>

        {/* Token Telemetry Bar */}
        {usageLog.length > 0 ? (
          <div className="shrink-0 bg-[#090b0f] border-t border-white/[0.08] px-4 py-2.5 overflow-y-auto max-h-[115px]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Activity size={12} className={theme.classes.iconActive} />
                <span className="font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Multi-Model Execution Telemetry ({usageLog.length} stages)
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">
                Total:{" "}
                {usageLog.reduce((acc, item) => acc + (item.usage?.total_tokens || 0), 0)} tokens
              </span>
            </div>
            <div className="space-y-1">
              {usageLog.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between font-mono text-[11px] bg-zinc-900/60 border border-white/[0.05] px-2.5 py-1 rounded"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-200 truncate">{log.role}</span>
                    <span className="text-zinc-300 px-1.5 py-0.5 rounded bg-zinc-950 border border-white/[0.08]">
                      {log.model}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 shrink-0">
                    <span>in:{log.usage.prompt_tokens}</span>
                    <span>out:{log.usage.completion_tokens}</span>
                    <span className={theme.classes.draftTitle}>{log.usage.total_tokens} tok</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
