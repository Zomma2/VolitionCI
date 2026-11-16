"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWizardStore } from "@/store/useWizardStore";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import { AI_MODEL_OPTIONS, ModelSelectionId, getAIModelOption } from "@/lib/aiModels";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
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
    <div className="flex items-center justify-center h-full bg-[#09090b] font-mono text-zinc-500 text-xs">
      Loading editor...
    </div>
  ),
});

function resolveArtifactMeta(archetype: string, provider: string) {
  if (archetype === "terraform") {
    return {
      fileName: "main.tf",
      filePath: "infra/main.tf",
      language: "hcl",
      badge: "HCL2 Validated",
    };
  }
  if (archetype === "kubernetes") {
    return {
      fileName: "k8s-manifests.yaml",
      filePath: "k8s/manifests.yaml",
      language: "yaml",
      badge: "YAML Validated",
    };
  }
  if (archetype === "docker") {
    return {
      fileName: "docker-compose.yml",
      filePath: "docker-compose.yml",
      language: "yaml",
      badge: "Compose Validated",
    };
  }
  if (provider === "GitLab CI") {
    return {
      fileName: ".gitlab-ci.yml",
      filePath: ".gitlab-ci.yml",
      language: "yaml",
      badge: "YAML Validated",
    };
  }
  if (provider === "Bitbucket Pipelines") {
    return {
      fileName: "bitbucket-pipelines.yml",
      filePath: "bitbucket-pipelines.yml",
      language: "yaml",
      badge: "YAML Validated",
    };
  }
  if (provider === "CircleCI") {
    return {
      fileName: "config.yml",
      filePath: ".circleci/config.yml",
      language: "yaml",
      badge: "YAML Validated",
    };
  }
  if (provider === "Jenkins") {
    return {
      fileName: "Jenkinsfile",
      filePath: "Jenkinsfile",
      language: "groovy",
      badge: "Jenkinsfile Validated",
    };
  }
  return {
    fileName: "pipeline.yml",
    filePath: ".github/workflows/pipeline.yml",
    language: "yaml",
    badge: "YAML Validated",
  };
}

export default function Step4Execution() {
  const {
    archetype,
    status,
    repoContext,
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
  const [telemetryExpanded, setTelemetryExpanded] = useState(false);

  const theme = ARCHETYPE_THEMES[archetype];
  const activePlatform = targetPlatform || ciProvider;
  const meta = resolveArtifactMeta(archetype, activePlatform);
  const activeModelMeta = getAIModelOption(selectedModel);

  useEffect(() => {
    const currentState = useWizardStore.getState();
    if (currentState.status === "complete" && synthTrigger === 0 && currentState.generatedCode) {
      return;
    }

    const abortController = new AbortController();
    let isActive = true;
    let receivedTerminalEvent = false;
    let latestPartialCode = "";

    const completeWithCode = (code: string, warning?: string) => {
      receivedTerminalEvent = true;
      const latestState = useWizardStore.getState();
      const plat = latestState.targetPlatform || latestState.ciProvider;
      setGeneratedCode(code);
      setStatus("complete", warning || "");
      saveRunToHistory({
        title: latestState.repoUrl || `${plat} ${latestState.archetype}`,
        archetype: latestState.archetype,
        targetPlatform: plat,
        modelId: latestState.selectedModel,
        code,
      });
    };

    const processSseFrame = (rawFrame: string) => {
      const lines = rawFrame.split("\n");
      let eventType = "";
      const dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trim());
        }
      }

      if (!eventType || dataLines.length === 0) return;
      const dataPayload = dataLines.join("\n");

      try {
        const parsed = JSON.parse(dataPayload);

        if (eventType === "status") {
          setStatus(parsed.step);
          if (parsed.attempt) setAttempt(parsed.attempt);
          if (parsed.module) setCurrentModule(parsed.module);
          if (parsed.current) {
            setModuleProgress({ current: parsed.current, total: parsed.total });
          }
        } else if (eventType === "usage") {
          setUsageLog((prev) => [...prev, parsed]);
        } else if (eventType === "partial") {
          if (parsed.code) {
            latestPartialCode = parsed.code;
          }
        } else if (eventType === "complete") {
          completeWithCode(parsed.code || latestPartialCode, parsed.warning);
        } else if (eventType === "error") {
          receivedTerminalEvent = true;
          setStatus("error", parsed.message || "Generation failed.");
        }
      } catch (parseErr) {
        console.error("SSE Frame Parse Error:", parseErr);
      }
    };

    const startSynthesis = async () => {
      const latest = useWizardStore.getState();
      const plat = latest.targetPlatform || latest.ciProvider;

      setUsageLog([]);
      setAttempt(0);
      setCurrentModule("");
      setModuleProgress({ current: 0, total: 0 });
      setStatus("planning", "");

      try {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
          body: JSON.stringify({
            repoContext:
              latest.repoContext ||
              `Target Archetype: ${latest.archetype}\nTarget Platform: ${plat}`,
            userAnswers: latest.userAnswers,
            provider: plat,
            archetype: latest.archetype,
            selectedModel: latest.selectedModel,
          }),
        });

        if (!res.ok || !res.body) {
          if (isActive) {
            setStatus("error", `Server responded with HTTP ${res.status}`);
          }
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (isActive) {
          const { value, done } = await reader.read();
          if (value) {
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

            let boundary = buffer.indexOf("\n\n");
            while (boundary !== -1) {
              const frame = buffer.slice(0, boundary).trim();
              buffer = buffer.slice(boundary + 2);
              if (frame) {
                processSseFrame(frame);
              }
              boundary = buffer.indexOf("\n\n");
            }
          }

          if (done) {
            const remaining = buffer.trim();
            if (remaining) {
              processSseFrame(remaining);
            }
            if (!receivedTerminalEvent && isActive) {
              if (latestPartialCode.trim().length > 0) {
                completeWithCode(latestPartialCode);
              } else {
                setStatus(
                  "error",
                  "Connection closed before completion. Click Retry below to run again."
                );
              }
            }
            break;
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        if (isActive) {
          setStatus("error", "Network connection interrupted during generation.");
        }
      }
    };

    startSynthesis();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [synthTrigger, setGeneratedCode, setStatus, saveRunToHistory]);

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
        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center">
          <AlertTriangle size={18} className="text-red-400" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="text-sm font-semibold text-white">Generation Failed</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">{errorMessage}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.1] transition-colors"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <button
            type="button"
            onClick={() => handleRerunWithModel("multi-agent")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white transition-colors"
          >
            <RefreshCw size={13} />
            Retry
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
      { id: 1, label: `01 · ${theme.shortLabel} Architecture Plan` },
      {
        id: 2,
        label:
          moduleProgress.total > 1
            ? `02 · Code Generation & Syntax Check (${currentModule})`
            : `02 · ${theme.shortLabel} Generation & Syntax Check`,
      },
      { id: 3, label: "03 · Completeness Verification" },
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="w-full max-w-lg rounded-xl bg-[#09090b] border border-white/[0.08] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-zinc-100">
                Generating {meta.filePath}
              </h3>
              <p className="font-mono text-[11px] text-zinc-400">
                {isHealing
                  ? `Refining syntax (${currentModule || `Pass ${attempt}`})`
                  : `${activeModelMeta.name} · ${activePlatform}`}
              </p>
            </div>
            <Loader2 size={15} className="text-zinc-300 animate-spin" />
          </div>

          <div className="space-y-2">
            {phases.map((p) => {
              const done = phaseIndex > p.id;
              const active = phaseIndex === p.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    active
                      ? "bg-white/[0.06] border-white/[0.18] text-white"
                      : done
                        ? "bg-zinc-900/40 border-white/[0.06] text-zinc-300"
                        : "bg-zinc-900/20 border-white/[0.04] text-zinc-500"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {done ? (
                      <CheckCircle2 size={13} className="text-zinc-300 shrink-0" />
                    ) : active ? (
                      <Loader2 size={13} className="text-zinc-200 animate-spin shrink-0" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span className="font-medium truncate">{p.label}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase text-zinc-400">
                    {done ? "Done" : active ? "Active" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>

          {usageLog.length > 0 ? (
            <div className="pt-2 border-t border-white/[0.06] space-y-1 max-h-32 overflow-y-auto">
              {usageLog.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between font-mono text-[11px] text-zinc-400"
                >
                  <span className="truncate">
                    {log.role} · <span className="text-zinc-200">{log.model}</span>
                  </span>
                  <span className="text-zinc-300 shrink-0">{log.usage.total_tokens} tok</span>
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
  const totalTokens = usageLog.reduce((acc, item) => acc + (item.usage?.total_tokens || 0), 0);
  const uniqueModelsUsed = Array.from(new Set(usageLog.map((u) => u.model)));

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Single Clean IDE Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/[0.07] bg-[#09090b] shrink-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-xs text-zinc-100 truncate">{meta.filePath}</span>
          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-zinc-900 text-zinc-300 border border-white/[0.08] shrink-0">
            {meta.badge}
          </span>
          <span className="hidden md:inline font-mono text-[11px] text-zinc-500">
            {lineCount} lines · {(byteSize / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Clean Typographic Model Switcher */}
          <div className="hidden xl:flex items-center gap-0.5 bg-zinc-900/80 p-0.5 rounded-md border border-white/[0.07] mr-1">
            {AI_MODEL_OPTIONS.map((m) => {
              const isActive = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleRerunWithModel(m.id)}
                  className={`px-2 py-0.5 rounded font-mono text-[10px] transition-colors ${
                    isActive
                      ? "bg-white/[0.12] text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title={`Re-run with ${m.name}`}
                >
                  {m.shortName}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsEditable((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              isEditable
                ? "bg-white/[0.1] border-white/[0.22] text-white"
                : "bg-zinc-900 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isEditable ? <Pencil size={11} /> : <Lock size={11} />}
            <span>{isEditable ? "Editing" : "Read-Only"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-200 transition-colors"
          >
            {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white transition-colors"
          >
            <Download size={11} />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors"
          >
            <RotateCcw size={11} />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
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
              minimap: { enabled: false },
              fontSize: 12.5,
              fontFamily: "var(--font-geist-mono), 'JetBrains Mono', monospace",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>

        {/* Compact 1-Line Collapsible Status Footer */}
        {usageLog.length > 0 ? (
          <div className="shrink-0 bg-[#09090b] border-t border-white/[0.07] px-4 py-1.5">
            <button
              type="button"
              onClick={() => setTelemetryExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between font-mono text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="truncate">
                Models: <span className="text-zinc-200">{uniqueModelsUsed.join(" · ")}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <span>{totalTokens.toLocaleString()} tokens</span>
                {telemetryExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </span>
            </button>

            {telemetryExpanded ? (
              <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1 max-h-28 overflow-y-auto">
                {usageLog.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between font-mono text-[11px] text-zinc-400"
                  >
                    <span className="truncate">
                      {log.role} · <span className="text-zinc-200">{log.model}</span>
                    </span>
                    <span className="text-zinc-300 shrink-0">
                      in:{log.usage.prompt_tokens} out:{log.usage.completion_tokens} (
                      {log.usage.total_tokens} tok)
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
