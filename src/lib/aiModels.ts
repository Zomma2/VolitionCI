export type ModelSelectionId =
  | "multi-agent"
  | "gemini-3.6-flash"
  | "codestral-latest"
  | "gpt-oss-120b"
  | "command-a"
  | "qwen-3.8-27b";

export interface AIModelOption {
  id: ModelSelectionId;
  name: string;
  shortName: string;
  provider: string;
  apiModelId: string;
  iconKey: string;
  badge: string;
  description: string;
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: "multi-agent",
    name: "Multi-Model Ensemble",
    shortName: "Multi-Model Ensemble",
    provider: "4-Provider Mesh",
    apiModelId: "ensemble",
    iconKey: "model-ensemble",
    badge: "Recommended",
    description:
      "Orchestrates Cohere Command A (Planner), Mistral Codestral + Gemini 3.6 Flash (Code Workers), and Groq GPT-OSS 120B (Validator).",
  },
  {
    id: "codestral-latest",
    name: "Mistral Codestral",
    shortName: "Codestral",
    provider: "Mistral AI",
    apiModelId: "codestral-latest",
    iconKey: "model-mistral",
    badge: "128K Code",
    description:
      "Dedicated low-latency code & IaC generation engine optimized for HCL, YAML, and DevSecOps scripts.",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    shortName: "Gemini 3.6",
    provider: "Google",
    apiModelId: "models/gemini-3.6-flash",
    iconKey: "model-gemini",
    badge: "Reasoning",
    description:
      "Deep architectural reasoning model with extended 8K output budget for complex cloud topologies.",
  },
  {
    id: "gpt-oss-120b",
    name: "GPT-OSS 120B",
    shortName: "GPT-OSS 120B",
    provider: "Groq LPU",
    apiModelId: "openai/gpt-oss-120b",
    iconKey: "model-openai",
    badge: "120B Params",
    description:
      "High-parameter open-weights reasoning model running on high-throughput Groq LPU hardware.",
  },
  {
    id: "command-a",
    name: "Cohere Command A",
    shortName: "Command A",
    provider: "Cohere",
    apiModelId: "command-a-03-2025",
    iconKey: "model-cohere",
    badge: "Enterprise",
    description:
      "Enterprise structured planning and cloud specification model with strong policy adherence.",
  },
  {
    id: "qwen-3.8-27b",
    name: "Qwen 3.8 27B",
    shortName: "Qwen 3.8",
    provider: "Groq LPU",
    apiModelId: "qwen/qwen3.8-27b",
    iconKey: "model-qwen",
    badge: "Ultra-Fast",
    description:
      "Sub-second LPU inference ideal for rapid CI/CD workflow and Docker Compose iteration.",
  },
];

export function getAIModelOption(id?: string): AIModelOption {
  return AI_MODEL_OPTIONS.find((m) => m.id === id) || AI_MODEL_OPTIONS[0];
}
