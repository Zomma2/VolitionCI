"use client";

import { useWizardStore } from "@/store/useWizardStore";
import { AnimatePresence, motion } from "framer-motion";
import Step1Ingest from "./Step1Ingest";
import Step2Analyze from "./Step2Analyze";
import Step3Interrogate from "./Step3Interrogate";
import Step4Execution from "./Step4Execution";

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function Wizard() {
  const step = useWizardStore((state) => state.step);

  return (
    <div className="w-full h-[600px] glass rounded-2xl p-6 relative overflow-hidden glow-violet-sm">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <Step1Ingest />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <Step2Analyze />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <Step3Interrogate />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full !p-0">
            <Step4Execution />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

