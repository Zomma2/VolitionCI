"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShieldCheck, Terminal } from "lucide-react";
import logoImg from "../../../public/logo.png";

let hasCompletedBootInSession = false;

const BOOT_STAGES = [
  { threshold: 18, code: "01", label: "Mounting YAML AST & HCL2 structural verifiers" },
  { threshold: 48, code: "02", label: "Connecting 4-provider LLM failover mesh" },
  { threshold: 78, code: "03", label: "Loading multi-target synthesis blueprints" },
  { threshold: 96, code: "04", label: "Activating zero-trust DevSecOps workspace" },
];

export default function BootScreen() {
  const [visible, setVisible] = useState(() => !hasCompletedBootInSession);
  const [progress, setProgress] = useState(0);

  const finishBoot = useCallback(() => {
    hasCompletedBootInSession = true;
    setProgress(100);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (hasCompletedBootInSession) {
      setVisible(false);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const quickTimer = window.setTimeout(finishBoot, 220);
      return () => window.clearTimeout(quickTimer);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishBoot();
    };
    window.addEventListener("keydown", onKeyDown);

    const durationMs = 1350;
    const startTime = performance.now();
    let rafId = 0;
    let closeTimer = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const linear = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - linear, 2.6);
      const pct = Math.min(100, Math.round(eased * 100));
      setProgress(pct);

      if (linear < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        closeTimer = window.setTimeout(() => {
          finishBoot();
        }, 160);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(closeTimer);
    };
  }, [finishBoot]);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="volition-boot-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.015,
            filter: "blur(6px)",
            transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
          }}
          role="status"
          aria-live="polite"
          aria-label="Initializing VolitionCI Studio"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#07080b] bg-grid-surface px-4 py-6 select-none overflow-hidden"
        >
          {/* Subtle Ambient Radial Spotlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-cyan-500/[0.06] blur-[110px]"
          />

          {/* Top Telemetry Strip */}
          <div className="relative z-10 w-full max-w-2xl flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <div className="inline-flex items-center gap-2">
              <Terminal size={12} className="text-cyan-400" />
              <span>VOLITION-CI // SYNTHESIS ENGINE v0.4.2</span>
            </div>
            <button
              type="button"
              onClick={finishBoot}
              className="px-2.5 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Skip [ESC]
            </button>
          </div>

          {/* Center Boot Console */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#0b0d12]/95 border border-white/[0.09] shadow-[0_28px_70px_-15px_rgba(0,0,0,0.85)] p-6 sm:p-7 space-y-6">
            {/* Optical Progress Ring + Brand Emblem */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-[stroke-dashoffset] duration-75 ease-out"
                  />
                </svg>
                <div className="absolute inset-3 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex items-center justify-center">
                  <Image
                    src={logoImg}
                    alt="VolitionCI"
                    width={28}
                    height={28}
                    priority
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold tracking-tight text-zinc-100">
                    Volition<span className="text-cyan-400">CI</span>
                  </span>
                  <span className="font-mono text-xs font-semibold text-cyan-300 tabular-nums">
                    {progress}%
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-snug">
                  DevSecOps &amp; Cloud Infrastructure Studio (v0.4.2 Beta)
                </p>
                <div className="pt-1 flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>PIPELINE · TERRAFORM · KUBERNETES · DOCKER</span>
                </div>
              </div>
            </div>

            {/* Precision Linear Progress Bar */}
            <div className="space-y-2">
              <div className="h-1.5 w-full rounded-full bg-zinc-900 border border-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 transition-[width] duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Subsystem Checklist Readout */}
            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
              {BOOT_STAGES.map((stage) => {
                const isDone = progress >= stage.threshold;
                return (
                  <div
                    key={stage.code}
                    className="flex items-center justify-between gap-3 font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-zinc-600">{stage.code}</span>
                      <span
                        className={`truncate transition-colors ${
                          isDone ? "text-zinc-200" : "text-zinc-500"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                        isDone
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "bg-zinc-900 text-zinc-500 border border-white/[0.05]"
                      }`}
                    >
                      {isDone ? <Check size={10} className="text-emerald-400" /> : null}
                      <span>{isDone ? "READY" : "BOOT"}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Security & Author Signature */}
          <div className="relative z-10 w-full max-w-2xl flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Deterministic Self-Healing Verification</span>
            </span>
            <span>Designed by Omar Hazem · meetomarhazem.com</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
