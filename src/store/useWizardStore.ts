import { create } from "zustand";

export interface AgentQuestion {
  id: string;
  category: string;
  question: string;
  rationale: string;
  type: string;
  options: string[];
}

export type Archetype = "pipeline" | "terraform" | "kubernetes" | "docker";
export type WizardStatus = "idle" | "analyzing" | "synthesizing" | "validating" | "semantic_validation" | "self_healing" | "complete" | "error";

export interface WizardStore {
  step: 1 | 2 | 3 | 4;
  archetype: Archetype;
  targetPlatform: string;
  repoUrl: string;
  repoContext: string;
  ciProvider: string;
  detectedStack: any;
  agentQuestions: AgentQuestion[];
  userAnswers: Record<string, string>;
  generatedCode: string;
  status: WizardStatus;
  errorMessage?: string;
  
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setArchetype: (archetype: Archetype) => void;
  setTargetPlatform: (platform: string) => void;
  setRepoData: (url: string, context: string) => void;
  setInterrogationData: (stack: any, questions: AgentQuestion[]) => void;
  setAnswer: (id: string, answer: string) => void;
  setCiProvider: (provider: string) => void;
  setStatus: (status: WizardStore["status"], errorMessage?: string) => void;
  setGeneratedCode: (code: string) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardStore>((set) => ({
  step: 1,
  archetype: "pipeline",
  targetPlatform: "GitHub Actions",
  repoUrl: "",
  repoContext: "",
  ciProvider: "GitHub Actions",
  detectedStack: null,
  agentQuestions: [],
  userAnswers: {},
  generatedCode: "",
  status: "idle",
  errorMessage: "",
  
  setStep: (step) => set({ step }),
  setArchetype: (archetype) => set({ archetype }),
  setTargetPlatform: (targetPlatform) => set({ targetPlatform, ciProvider: targetPlatform }),
  setRepoData: (repoUrl, repoContext) => set({ repoUrl, repoContext }),
  setInterrogationData: (detectedStack, agentQuestions) => set({ detectedStack, agentQuestions }),
  setAnswer: (id, answer) => set((state) => ({
    userAnswers: { ...state.userAnswers, [id]: answer }
  })),
  setCiProvider: (ciProvider) => set({ ciProvider, targetPlatform: ciProvider }),
  setStatus: (status, errorMessage = "") => set({ status, errorMessage }),
  setGeneratedCode: (generatedCode) => set({ generatedCode }),
  reset: () => set({
    step: 1,
    archetype: "pipeline",
    targetPlatform: "GitHub Actions",
    repoUrl: "",
    repoContext: "",
    ciProvider: "GitHub Actions",
    detectedStack: null,
    agentQuestions: [],
    userAnswers: {},
    generatedCode: "",
    status: "idle",
    errorMessage: "",
  })
}));
