"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import logoImg from "../../../public/logo.png";

let hasCompletedBootInSession = false;

export default function BootScreen() {
  const [visible, setVisible] = useState(() => !hasCompletedBootInSession);
  const [progress, setProgress] = useState(0);

  const finishBoot = useCallback(() => {
    hasCompletedBootInSession = true;
    setProgress(100);
    setVisible(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, []);

  useEffect(() => {
    // Always ensure body scroll is unlocked when not visible
    if (!visible || hasCompletedBootInSession) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      setVisible(false);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const quickTimer = window.setTimeout(finishBoot, 150);
      return () => window.clearTimeout(quickTimer);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishBoot();
    };
    window.addEventListener("keydown", onKeyDown);

    const durationMs = 950;
    const startTime = performance.now();
    let rafId = 0;
    let closeTimer = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const linear = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - linear, 2.8);
      const pct = Math.min(100, Math.round(eased * 100));
      setProgress(pct);

      if (linear < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        closeTimer = window.setTimeout(() => {
          finishBoot();
        }, 120);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(closeTimer);
    };
  }, [visible, finishBoot]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="volition-boot-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
          }}
          role="status"
          aria-live="polite"
          aria-label="Loading VolitionCI"
          onClick={finishBoot}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b] px-4 select-none"
        >
          <div className="w-full max-w-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-zinc-900 border border-white/[0.08] flex items-center justify-center">
                  <Image
                    src={logoImg}
                    alt="VolitionCI"
                    width={18}
                    height={18}
                    priority
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-semibold tracking-tight text-zinc-100">
                  VolitionCI
                </span>
              </div>
              <span className="font-mono text-xs text-zinc-500 tabular-nums">
                {progress}%
              </span>
            </div>

            <div className="h-[2px] w-full rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-zinc-200 transition-[width] duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
              <span>Initializing workspace</span>
              <span>ESC to skip</span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
