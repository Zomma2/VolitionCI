import { create } from "zustand";
import { ModelSelectionId } from "@/lib/aiModels";

export interface AgentQuestion {
  id: string;
  category: string;
  question: string;
  rationale: string;
  type: string;
  options: string[];
}

export type Archetype = "pipeline" | "terraform" | "kubernetes" | "docker";
export type IngestMode = "chat" | "scan" | "manual";
export type WizardStatus =
  | "idle"
  | "analyzing"
  | "planning"
  | "synthesizing_module"
  | "synthesizing"
  | "validating"
  | "semantic_validation"
  | "self_healing"
  | "complete"
  | "error";

export interface SavedSynthesisRun {
  id: string;
  title: string;
  archetype: Archetype;
  targetPlatform: string;
  modelId?: ModelSelectionId;
  code: string;
  createdAt: string;
}

const HISTORY_STORAGE_KEY = "volition_ci_runs_v1";

function readStoredHistory(): SavedSynthesisRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredHistory(runs: SavedSynthesisRun[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(runs.slice(0, 15)));
  } catch {
    // Ignore storage quota errors
  }
}

export interface WizardStore {
  step: 1 | 2 | 3 | 4;
  ingestMode: IngestMode;
  presetPrompt: string;
  archetype: Archetype;
  targetPlatform: string;
  selectedModel: ModelSelectionId;
  repoUrl: string;
  repoContext: string;
  ciProvider: string;
  detectedStack: any;
  agentQuestions: AgentQuestion[];
  userAnswers: Record<string, string>;
  generatedCode: string;
  status: WizardStatus;
  errorMessage?: string;
  savedRuns: SavedSynthesisRun[];

  setStep: (step: 1 | 2 | 3 | 4) => void;
  setIngestMode: (mode: IngestMode) => void;
  setPresetPrompt: (prompt: string) => void;
  setArchetype: (archetype: Archetype) => void;
  setTargetPlatform: (platform: string) => void;
  setSelectedModel: (model: ModelSelectionId) => void;
  setRepoData: (url: string, context: string) => void;
  setInterrogationData: (stack: any, questions: AgentQuestion[]) => void;
  setAnswer: (id: string, answer: string) => void;
  applyDefaultAnswers: () => void;
  setCiProvider: (provider: string) => void;
  setStatus: (status: WizardStore["status"], errorMessage?: string) => void;
  setGeneratedCode: (code: string) => void;
  loadBlueprintIntoEditor: (payload: {
    title: string;
    archetype: Archetype;
    targetPlatform: string;
    code: string;
  }) => void;
  loadBlueprintIntoPrompt: (payload: {
    archetype: Archetype;
    targetPlatform: string;
    prompt: string;
  }) => void;
  hydrateHistory: () => void;
  saveRunToHistory: (run: Omit<SavedSynthesisRun, "id" | "createdAt">) => void;
  deleteHistoryRun: (id: string) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  step: 1,
  ingestMode: "chat",
  presetPrompt: "",
  archetype: "pipeline",
  targetPlatform: "GitHub Actions",
  selectedModel: "multi-agent",
  repoUrl: "",
  repoContext: "",
  ciProvider: "GitHub Actions",
  detectedStack: null,
  agentQuestions: [],
  userAnswers: {},
  generatedCode: "",
  status: "idle",
  errorMessage: "",
  savedRuns: [],

  setStep: (step) => set({ step }),
  setIngestMode: (ingestMode) => set({ ingestMode }),
  setPresetPrompt: (presetPrompt) => set({ presetPrompt }),
  setArchetype: (archetype) => set({ archetype }),
  setTargetPlatform: (targetPlatform) => set({ targetPlatform, ciProvider: targetPlatform }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setRepoData: (repoUrl, repoContext) => set({ repoUrl, repoContext }),
  setInterrogationData: (detectedStack, agentQuestions) => set({ detectedStack, agentQuestions }),
  setAnswer: (id, answer) =>
    set((state) => ({
      userAnswers: { ...state.userAnswers, [id]: answer },
    })),
  applyDefaultAnswers: () =>
    set((state) => {
      const next = { ...state.userAnswers };
      for (const q of state.agentQuestions) {
        if (!next[q.id] && q.options.length > 0) {
          next[q.id] = q.options[0];
        }
      }
      return { userAnswers: next };
    }),
  setCiProvider: (ciProvider) => set({ ciProvider, targetPlatform: ciProvider }),
  setStatus: (status, errorMessage = "") => set({ status, errorMessage }),
  setGeneratedCode: (generatedCode) => set({ generatedCode }),
  loadBlueprintIntoEditor: ({ title, archetype, targetPlatform, code }) =>
    set({
      archetype,
      targetPlatform,
      ciProvider: targetPlatform,
      repoUrl: title,
      repoContext: `Blueprint Specification: ${title} (${archetype} on ${targetPlatform})`,
      generatedCode: code,
      status: "complete",
      errorMessage: "",
      step: 4,
    }),
  loadBlueprintIntoPrompt: ({ archetype, targetPlatform, prompt }) =>
    set({
      step: 1,
      ingestMode: "chat",
      archetype,
      targetPlatform,
      ciProvider: targetPlatform,
      presetPrompt: prompt,
      status: "idle",
      errorMessage: "",
    }),
  hydrateHistory: () => {
    set({ savedRuns: readStoredHistory() });
  },
  saveRunToHistory: (run) => {
    const existing = get().savedRuns.length > 0 ? get().savedRuns : readStoredHistory();
    if (existing[0] && existing[0].code === run.code && existing[0].archetype === run.archetype) {
      return;
    }
    const entry: SavedSynthesisRun = {
      ...run,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...existing].slice(0, 15);
    writeStoredHistory(updated);
    set({ savedRuns: updated });
  },
  deleteHistoryRun: (id) => {
    const updated = get().savedRuns.filter((r) => r.id !== id);
    writeStoredHistory(updated);
    set({ savedRuns: updated });
  },
  reset: () =>
    set((state) => ({
      step: 1,
      ingestMode: "chat",
      presetPrompt: "",
      archetype: "pipeline",
      targetPlatform: "GitHub Actions",
      selectedModel: state.selectedModel,
      repoUrl: "",
      repoContext: "",
      ciProvider: "GitHub Actions",
      detectedStack: null,
      agentQuestions: [],
      userAnswers: {},
      generatedCode: "",
      status: "idle",
      errorMessage: "",
      savedRuns: state.savedRuns,
    })),
}));
