"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWizardStore } from "@/store/useWizardStore";
import { CheckCheck, Copy, Download, Activity, AlertTriangle, ArrowLeft } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#0d0d0d] text-white/30 text-xs">
      Loading editor...
    </div>
  ),
});

export default function Step4Execution() {
  const { 
    archetype, 
    status, 
    repoContext, 
    userAnswers, 
    targetPlatform, 
    ciProvider, 
    generatedCode, 
    errorMessage, 
    setStatus, 
    setGeneratedCode, 
    setStep 
  } = useWizardStore();
  
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [usageLog, setUsageLog] = useState<{ model: string; role: string; usage: any }[]>([]);
  const [currentModule, setCurrentModule] = useState("");
  const [moduleProgress, setModuleProgress] = useState({ current: 0, total: 0 });

  const meta = {
    pipeline: {
      fileName: "pipeline.yml",
      language: "yaml",
      badge: "Pipeline Ready",
      synthesizingText: "Synthesizing CI/CD Pipeline...",
    },
    terraform: {
      fileName: "main.tf",
      language: "hcl",
      badge: "Terraform Ready",
      synthesizingText: "Synthesizing Terraform HCL...",
    },
    kubernetes: {
      fileName: "k8s-manifests.yaml",
      language: "yaml",
      badge: "Manifests Ready",
      synthesizingText: "Synthesizing Kubernetes Manifests...",
    },
    docker: {
      fileName: "docker-compose.yml",
      language: "yaml",
      badge: "Compose Ready",
      synthesizingText: "Synthesizing Docker Compose...",
    },
  }[archetype];

  useEffect(() => {
    if (status !== "synthesizing") return;

    let isSubscribed = true;

    const startSynthesis = async () => {
      try {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            repoContext, 
            userAnswers, 
            provider: targetPlatform || ciProvider,
            archetype 
          }),
        });

        if (!res.ok || !res.body) {
          setStatus("error", `Server error ${res.status}`);
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
            
            let boundary = buffer.indexOf('\n\n');
            while (boundary !== -1) {
              const ev = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary + 2);
              boundary = buffer.indexOf('\n\n');

              if (!ev.trim()) continue;

              try {
                if (ev.startsWith('event: status')) {
                  const dataStr = ev.split('\ndata: ')[1];
                  if (dataStr) {
                    const parsed = JSON.parse(dataStr);
                    setStatus(parsed.step);
                    if (parsed.attempt) setAttempt(parsed.attempt);
                    if (parsed.module) setCurrentModule(parsed.module);
                    if (parsed.current) setModuleProgress({ current: parsed.current, total: parsed.total });
                  }
                } else if (ev.startsWith('event: usage')) {
                  const dataStr = ev.split('\ndata: ')[1];
                  if (dataStr) {
                    const parsed = JSON.parse(dataStr);
                    setUsageLog(prev => [...prev, parsed]);
                  }
                } else if (ev.startsWith('event: complete')) {
                  const dataStr = ev.split('\ndata: ')[1];
                  if (dataStr) {
                    const parsed = JSON.parse(dataStr);
                    setGeneratedCode(parsed.code);
                    setStatus("complete", parsed.warning || "");
                  }
                } else if (ev.startsWith('event: error')) {
                  const dataStr = ev.split('\ndata: ')[1];
                  if (dataStr) {
                    const parsed = JSON.parse(dataStr);
                    setStatus("error", parsed.message);
                  }
                }
              } catch (parseError) {
                console.error("SSE Parse Error:", parseError, "Event Data:", ev);
              }
            }
          }
        }
      } catch (err: any) {
        if (isSubscribed) setStatus("error", "Network error during synthesis.");
      }
    };

    startSynthesis();

    return () => {
      isSubscribed = false;
    };
  }, []);

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
      <div className="flex flex-col h-full items-center justify-center space-y-3 text-center p-6">
        <AlertTriangle size={28} className="text-red-400" />
        <h3 className="text-base font-bold text-white">Synthesis Failed</h3>
        <p className="text-xs text-white/50 max-w-sm leading-relaxed">{errorMessage}</p>
        <button onClick={() => setStep(3)} className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  if (status !== "complete") {
    const isHealing = status === "self_healing";
    const isLinting = status === "validating" || status === "semantic_validation";

    return (
      <div className={`flex flex-col items-center justify-center h-full gap-5 transition-colors duration-500 ${isHealing ? 'bg-orange-950/20' : ''}`}>
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className={`absolute inset-0 rounded-full ${isHealing ? 'bg-orange-600/10' : 'bg-emerald-600/10'} animate-ping`} style={{ animationDuration: "2s" }} />
          <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${isHealing ? 'from-orange-600/30 to-amber-600/30' : 'from-emerald-600/30 to-teal-600/30'} border flex items-center justify-center backdrop-blur-sm ${isHealing ? 'animate-pulse' : ''}`}>
            {isHealing ? (
              <AlertTriangle className="h-4 w-4 text-orange-400 animate-bounce" />
            ) : isLinting ? (
              <Activity className="h-4 w-4 text-blue-400 animate-pulse" />
            ) : (
              <svg className="animate-spin h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>
        </div>
        <div className="text-center space-y-1 z-10">
          <p className={`text-xs font-semibold ${isHealing ? 'text-orange-400/90' : isLinting ? 'text-blue-400/90' : 'text-white/80'}`}>
            {status === "planning" ? "Planner Model designing architectural chunks..."
              : status === "synthesizing_module" ? `Synthesizing ${currentModule} (${moduleProgress.current}/${moduleProgress.total})...`
              : status === "synthesizing" ? meta.synthesizingText
              : status === "validating" ? "Validating syntax and structural contracts..."
              : status === "semantic_validation" ? "LLM verifying user components..."
              : `Linter errors detected. Agent self-correcting (Attempt ${attempt} of 3)...`}
          </p>
          <p className="text-[11px] text-white/30">
            {isHealing ? "Feeding errors back to Groq for automated remediation." : "Targeting production-ready outputs."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-white/50">{meta.fileName}</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            {meta.badge}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setStep(1)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all mr-1">
            <ArrowLeft size={12} /> Start Over
          </button>
          <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all">
            {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all">
            <Download size={12} /> Download
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex flex-col">
        {errorMessage && (
          <div className="absolute top-0 inset-x-0 z-20 bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center text-xs text-yellow-300 font-medium flex items-center justify-center gap-2">
            <AlertTriangle size={13} />
            {errorMessage}
          </div>
        )}

        <div className="flex-1 min-h-0">
          <MonacoEditor
            height="100%"
            language={meta.language}
            value={generatedCode}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: true },
              fontSize: 12,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              wordWrap: "on",
              padding: { top: errorMessage ? 40 : 16, bottom: 16 },
            }}
          />
        </div>

        {/* ── Token Usage Footer ── */}
        {usageLog.length > 0 && (
          <div className="shrink-0 bg-[#0d0d0d] border-t border-white/[0.05] p-3 overflow-y-auto max-h-[120px] custom-scrollbar">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-violet-400" />
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">LLM Engine Telemetry</span>
            </div>
            <div className="space-y-1.5">
              {usageLog.map((log, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] bg-white/[0.02] border border-white/[0.04] p-2 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white/70">{log.role}</span>
                    <span className="text-white/30 px-1.5 py-0.5 rounded bg-white/[0.04]">{log.model}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/50">
                    <span>Prompt: <span className="text-white/80">{log.usage.prompt_tokens}</span></span>
                    <span>Completion: <span className="text-white/80">{log.usage.completion_tokens}</span></span>
                    <span className="text-violet-400 font-medium">Total: {log.usage.total_tokens}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
