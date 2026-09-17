"use client";

import dynamic from "next/dynamic";
import { Copy, Download, CheckCheck, AlertTriangle, Cpu, Sparkles } from "lucide-react";
import { useState } from "react";
import type { GenerationState, OutputType } from "@/types/pipeline";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#0d0d0d]">
      <div className="flex items-center gap-3 text-white/20 text-sm">
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading editor&hellip;
      </div>
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Language / filename mapping per output type
// ---------------------------------------------------------------------------

const OUTPUT_TYPE_META: Record<OutputType, { language: string; fileName: string; downloadName: string }> = {
  "ci-pipeline": { language: "yaml", fileName: "pipeline.yml", downloadName: "pipeline.yml" },
  "dockerfile": { language: "dockerfile", fileName: "Dockerfile", downloadName: "Dockerfile" },
  "docker-compose": { language: "yaml", fileName: "docker-compose.yml", downloadName: "docker-compose.yml" },
  "proxy-config": { language: "nginx", fileName: "nginx.conf", downloadName: "nginx.conf" },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OutputPaneProps {
  state: GenerationState;
  outputType: OutputType;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OutputPane({ state, outputType }: OutputPaneProps) {
  const [copied, setCopied] = useState(false);
  const hasOutput = state.output.trim().length > 0;
  const meta = OUTPUT_TYPE_META[outputType];

  async function handleCopy() {
    if (!hasOutput) return;
    await navigator.clipboard.writeText(state.output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!hasOutput) return;
    const blob = new Blob([state.output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = meta.downloadName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs font-medium text-white/30">{meta.fileName}</span>
          {state.status === "success" && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Ready
            </span>
          )}
        </div>

        {hasOutput && (
          <div className="flex items-center gap-1">
            <ToolbarBtn onClick={handleCopy} icon={copied ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />} label={copied ? "Copied" : "Copy"} />
            <ToolbarBtn onClick={handleDownload} icon={<Download size={13} />} label="Download" />
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1 min-h-0">
        {state.status === "idle" && <IdlePlaceholder />}
        {(state.status === "queued" || state.status === "generating") && <LoadingView status={state.status} />}
        {state.status === "error" && <ErrorView message={state.errorMessage} />}

        <div className={`absolute inset-0 transition-opacity duration-300 ${hasOutput ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <MonacoEditor
            height="100%"
            language={meta.language}
            value={state.output}
            theme="vs-dark"
            options={{
              readOnly: false,
              minimap: { enabled: true, scale: 1 },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 20, bottom: 20 },
              overviewRulerLanes: 0,
              renderLineHighlight: "line",
              scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function IdlePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-10">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-violet-500/5 border border-violet-500/10 flex items-center justify-center">
          <Cpu size={32} className="text-white/10" />
        </div>
        <Sparkles size={14} className="absolute -top-1 -right-1 text-violet-400/50" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-white/40">Awaiting your configuration</p>
        <p className="text-xs text-white/20 max-w-[260px] leading-relaxed">
          Fill in your pipeline parameters and click{" "}
          <span className="text-violet-400/70">Generate Pipeline</span> to produce
          a production-ready configuration.
        </p>
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at center, rgb(139 92 246 / 0.04) 0%, transparent 65%), linear-gradient(rgb(255 255 255 / 0.015) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.015) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 32px 32px, 32px 32px",
      }} />
    </div>
  );
}

function LoadingView({ status }: { status: "queued" | "generating" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-violet-600/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-2 rounded-full bg-violet-600/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center backdrop-blur-sm">
          <svg className="animate-spin h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-sm font-semibold text-white/80">
          {status === "queued" ? "Waiting in queue…" : "Generating your configuration…"}
        </p>
        <p className="text-xs text-white/30 max-w-[240px] leading-relaxed">
          {status === "queued"
            ? "Another request is processing. You're next."
            : "Calling Groq GPT OSS 120B — this takes a few seconds."}
        </p>
      </div>
      <div className="w-48 h-1 rounded-full overflow-hidden bg-white/5">
        <div className="h-full w-full shimmer" />
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/8 border border-red-500/15 flex items-center justify-center">
        <AlertTriangle size={22} className="text-red-400/80" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-red-400/90">Generation Failed</p>
        <p className="text-xs text-white/30 max-w-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

function ToolbarBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
    >
      {icon}
      {label}
    </button>
  );
}
