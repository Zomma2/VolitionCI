"use client";

import { useEffect, useState } from "react";
import { useWizardStore, Archetype } from "@/store/useWizardStore";
import { ARCHETYPE_THEMES } from "@/lib/archetypeTheme";
import { AI_MODEL_OPTIONS, getAIModelOption } from "@/lib/aiModels";
import TechIcon from "@/components/ui/TechIcon";
import { ArrowRight, Check, Globe, RotateCcw } from "lucide-react";

const MAX_CHAT_TURNS = 3;

const ARCHETYPE_LIST: Archetype[] = ["pipeline", "terraform", "kubernetes", "docker"];

interface PlatformOption {
  name: string;
  iconKey: string;
}

const PLATFORM_CONFIG: Record<
  Archetype,
  { label: string; options: PlatformOption[]; default: string }
> = {
  pipeline: {
    label: "Provider",
    default: "GitHub Actions",
    options: [
      { name: "GitHub Actions", iconKey: "githubactions" },
      { name: "GitLab CI", iconKey: "gitlab" },
      { name: "Bitbucket Pipelines", iconKey: "bitbucket" },
      { name: "CircleCI", iconKey: "circleci" },
      { name: "Jenkins", iconKey: "jenkins" },
    ],
  },
  terraform: {
    label: "Cloud",
    default: "AWS",
    options: [
      { name: "AWS", iconKey: "aws" },
      { name: "Google Cloud", iconKey: "googlecloud" },
      { name: "Azure", iconKey: "azure" },
      { name: "DigitalOcean", iconKey: "digitalocean" },
    ],
  },
  kubernetes: {
    label: "Cluster",
    default: "Generic Kubernetes",
    options: [
      { name: "Generic Kubernetes", iconKey: "kubernetes" },
      { name: "Amazon EKS", iconKey: "aws-eks" },
      { name: "Google GKE", iconKey: "gcp-gke" },
      { name: "Azure AKS", iconKey: "azure-aks" },
      { name: "Minikube / Local", iconKey: "minikube" },
    ],
  },
  docker: {
    label: "Profile",
    default: "Local Development",
    options: [
      { name: "Local Development", iconKey: "runtime-local" },
      { name: "Production Swarm", iconKey: "runtime-swarm" },
      { name: "Testing / CI", iconKey: "runtime-ci" },
    ],
  },
};

interface TechOption {
  id: string;
  name: string;
  iconKey: string;
  category: string;
}

const getTechOptions = (archetype: Archetype, platform: string): TechOption[] => {
  const commonIac: TechOption[] = [
    { id: "terraform", name: "Terraform", iconKey: "terraform", category: "IaC" },
    { id: "opentofu", name: "OpenTofu", iconKey: "opentofu", category: "IaC" },
  ];

  if (archetype === "terraform") {
    if (platform === "Azure") {
      return [
        { id: "azure-vnet", name: "Azure VNet", iconKey: "azure-vnet", category: "Network" },
        { id: "azure-aks", name: "Azure AKS", iconKey: "azure-aks", category: "Compute" },
        { id: "azure-sql", name: "Azure SQL", iconKey: "azure-sql", category: "Database" },
        { id: "azure-blob", name: "Blob Storage", iconKey: "azure-blob", category: "Storage" },
        { id: "azure-kv", name: "Key Vault", iconKey: "azure-keyvault", category: "Security" },
        { id: "azure-fn", name: "Azure Functions", iconKey: "azure-functions", category: "Serverless" },
        ...commonIac,
      ];
    }
    if (platform === "Google Cloud") {
      return [
        { id: "gcp-vpc", name: "Cloud VPC", iconKey: "gcp-vpc", category: "Network" },
        { id: "gcp-run", name: "Cloud Run", iconKey: "gcp-cloudrun", category: "Serverless" },
        { id: "gcp-gke", name: "Google GKE", iconKey: "gcp-gke", category: "Compute" },
        { id: "gcp-sql", name: "Cloud SQL", iconKey: "gcp-cloudsql", category: "Database" },
        { id: "gcp-gcs", name: "Cloud Storage", iconKey: "gcp-gcs", category: "Storage" },
        { id: "gcp-sec", name: "Secret Manager", iconKey: "gcp-secrets", category: "Security" },
        ...commonIac,
      ];
    }
    if (platform === "DigitalOcean") {
      return [
        { id: "do-vpc", name: "Droplets & VPC", iconKey: "do-droplets", category: "Compute" },
        { id: "do-doks", name: "DOKS Cluster", iconKey: "do-doks", category: "Kubernetes" },
        { id: "do-pg", name: "Managed Postgres", iconKey: "do-postgres", category: "Database" },
        { id: "do-spaces", name: "DO Spaces", iconKey: "do-spaces", category: "Storage" },
        { id: "do-lb", name: "Load Balancer", iconKey: "do-lb", category: "Network" },
        { id: "do-reg", name: "DOCR Registry", iconKey: "do-registry", category: "Registry" },
        ...commonIac,
      ];
    }
    return [
      { id: "vpc", name: "AWS VPC", iconKey: "aws-vpc", category: "Network" },
      { id: "eks", name: "AWS EKS", iconKey: "aws-eks", category: "Cluster" },
      { id: "ecs", name: "AWS ECS", iconKey: "aws-ecs", category: "Compute" },
      { id: "rds", name: "AWS RDS", iconKey: "aws-rds", category: "Database" },
      { id: "s3", name: "AWS S3", iconKey: "aws-s3", category: "Storage" },
      { id: "dynamodb", name: "DynamoDB", iconKey: "aws-dynamodb", category: "NoSQL" },
      { id: "lambda", name: "AWS Lambda", iconKey: "aws-lambda", category: "Serverless" },
      { id: "iam", name: "AWS IAM", iconKey: "aws-iam", category: "Identity" },
      { id: "ecr", name: "AWS ECR", iconKey: "aws-ecr", category: "Registry" },
      { id: "cloudfront", name: "CloudFront", iconKey: "aws-cloudfront", category: "Edge CDN" },
      { id: "elasticache", name: "ElastiCache", iconKey: "aws-elasticache", category: "Cache" },
      { id: "secretsmanager", name: "Secrets Manager", iconKey: "aws-secrets", category: "KMS" },
      ...commonIac,
    ];
  }

  if (archetype === "kubernetes") {
    const k8sCommon: TechOption[] = [
      { id: "k8s", name: "Kubernetes", iconKey: "kubernetes", category: "Core API" },
      { id: "helm", name: "Helm", iconKey: "helm", category: "Packaging" },
      { id: "kustomize", name: "Kustomize", iconKey: "kustomize", category: "Overlays" },
      { id: "nginx", name: "Ingress-Nginx", iconKey: "nginx", category: "Ingress" },
      { id: "traefik", name: "Traefik", iconKey: "traefik", category: "Gateway" },
      { id: "certmanager", name: "Cert-Manager", iconKey: "cert-manager", category: "TLS" },
      { id: "prometheus", name: "Prometheus", iconKey: "prometheus", category: "Metrics" },
      { id: "grafana", name: "Grafana", iconKey: "grafana", category: "Dashboards" },
      { id: "istio", name: "Istio", iconKey: "istio", category: "mTLS Mesh" },
      { id: "cilium", name: "Cilium", iconKey: "cilium", category: "eBPF CNI" },
      { id: "argo", name: "ArgoCD", iconKey: "argocd", category: "GitOps" },
      { id: "docker", name: "Docker", iconKey: "docker", category: "Runtime" },
    ];
    if (platform === "Amazon EKS") {
      return [
        { id: "aws-eks", name: "Amazon EKS", iconKey: "aws-eks", category: "Control Plane" },
        ...k8sCommon.slice(0, 11),
      ];
    }
    if (platform === "Azure AKS") {
      return [
        { id: "azure-aks", name: "Azure AKS", iconKey: "azure-aks", category: "Control Plane" },
        ...k8sCommon.slice(0, 11),
      ];
    }
    if (platform === "Google GKE") {
      return [
        { id: "gcp-gke", name: "Google GKE", iconKey: "gcp-gke", category: "Control Plane" },
        ...k8sCommon.slice(0, 11),
      ];
    }
    return k8sCommon;
  }

  if (archetype === "pipeline") {
    return [
      { id: "nextjs", name: "Next.js", iconKey: "nextjs", category: "Web" },
      { id: "react", name: "React", iconKey: "react", category: "Frontend" },
      { id: "node", name: "Node.js", iconKey: "nodejs", category: "Runtime" },
      { id: "python", name: "Python", iconKey: "python", category: "Backend" },
      { id: "go", name: "Go", iconKey: "go", category: "Systems" },
      { id: "rust", name: "Rust", iconKey: "rust", category: "Systems" },
      { id: "java", name: "Java", iconKey: "java", category: "Enterprise" },
      { id: "postgres", name: "PostgreSQL", iconKey: "postgresql", category: "Database" },
      { id: "redis", name: "Redis", iconKey: "redis", category: "Cache" },
      { id: "prisma", name: "Prisma", iconKey: "prisma", category: "ORM" },
      { id: "docker", name: "Docker Buildx", iconKey: "docker", category: "Container" },
      { id: "trivy", name: "Trivy", iconKey: "trivy", category: "CVE Scan" },
      { id: "semgrep", name: "Semgrep", iconKey: "semgrep", category: "SAST" },
      { id: "sonarqube", name: "SonarQube", iconKey: "sonarqube", category: "Quality" },
      { id: "cosign", name: "Cosign", iconKey: "cosign", category: "Signing" },
      { id: "k8s", name: "Kubernetes", iconKey: "kubernetes", category: "Deploy" },
    ];
  }

  return [
    { id: "docker", name: "Docker Engine", iconKey: "docker", category: "Runtime" },
    { id: "postgres", name: "PostgreSQL", iconKey: "postgresql", category: "Database" },
    { id: "mysql", name: "MySQL", iconKey: "mysql", category: "Database" },
    { id: "mongo", name: "MongoDB", iconKey: "mongodb", category: "Document" },
    { id: "redis", name: "Redis", iconKey: "redis", category: "Cache" },
    { id: "rabbitmq", name: "RabbitMQ", iconKey: "rabbitmq", category: "Broker" },
    { id: "kafka", name: "Apache Kafka", iconKey: "kafka", category: "Streaming" },
    { id: "nginx", name: "Nginx", iconKey: "nginx", category: "Proxy" },
    { id: "traefik", name: "Traefik", iconKey: "traefik", category: "Edge" },
    { id: "node", name: "Node.js", iconKey: "nodejs", category: "Service" },
    { id: "python", name: "Python", iconKey: "python", category: "Service" },
    { id: "go", name: "Go", iconKey: "go", category: "Service" },
    { id: "java", name: "Java", iconKey: "java", category: "Service" },
    { id: "elasticsearch", name: "Elasticsearch", iconKey: "elasticsearch", category: "Search" },
    { id: "prometheus", name: "Prometheus", iconKey: "prometheus", category: "Metrics" },
    { id: "grafana", name: "Grafana", iconKey: "grafana", category: "Telemetry" },
  ];
};

interface ChatConfigDraft {
  repoUrl?: string;
  archetype?: Archetype;
  targetPlatform?: string;
  technologies?: string[];
  recommendations?: { name: string; slug: string; color: string; reason: string }[];
}

interface ArchetypeChatSession {
  history: { role: "user" | "ai"; content: string; modelUsed?: string }[];
  revisions: number;
  config: ChatConfigDraft | null;
  selectedTech: string[];
}

const createEmptySession = (): ArchetypeChatSession => ({
  history: [],
  revisions: 0,
  config: null,
  selectedTech: [],
});

export default function Step1Ingest() {
  const {
    archetype,
    targetPlatform,
    selectedModel,
    ingestMode,
    presetPrompt,
    setIngestMode,
    setPresetPrompt,
    setArchetype,
    setTargetPlatform,
    setSelectedModel,
    setRepoData,
    setStatus,
    setStep,
    setInterrogationData,
  } = useWizardStore();

  const [url, setUrl] = useState("");
  const [manualTech, setManualTech] = useState<string[]>([]);
  const [error, setError] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [sessions, setSessions] = useState<Record<Archetype, ArchetypeChatSession>>(() => ({
    pipeline: createEmptySession(),
    terraform: createEmptySession(),
    kubernetes: createEmptySession(),
    docker: createEmptySession(),
  }));
  const [isChatLoading, setIsChatLoading] = useState(false);

  const theme = ARCHETYPE_THEMES[archetype];
  const currentPlatformConfig = PLATFORM_CONFIG[archetype];
  const activeSession = sessions[archetype];
  const activeModelMeta = getAIModelOption(selectedModel);

  useEffect(() => {
    if (presetPrompt) {
      setChatInput(presetPrompt);
      setPresetPrompt("");
    }
  }, [presetPrompt, setPresetPrompt]);

  const updateSession = (
    targetArch: Archetype,
    updater: (prev: ArchetypeChatSession) => ArchetypeChatSession
  ) => {
    setSessions((prev) => ({
      ...prev,
      [targetArch]: updater(prev[targetArch]),
    }));
  };

  const handleArchetypeChange = (newArchetype: Archetype) => {
    setArchetype(newArchetype);
    setTargetPlatform(PLATFORM_CONFIG[newArchetype].default);
    setManualTech([]);
    setError("");
  };

  const toggleChatTech = (name: string) => {
    updateSession(archetype, (prev) => ({
      ...prev,
      selectedTech: prev.selectedTech.includes(name)
        ? prev.selectedTech.filter((t) => t !== name)
        : [...prev.selectedTech, name],
    }));
  };

  const toggleManualTech = (name: string) => {
    setManualTech((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const resetChatSession = () => {
    updateSession(archetype, () => createEmptySession());
    setChatInput("");
  };

  const submitChatPrompt = async (
    promptText: string,
    overrideArchetype?: Archetype,
    overridePlatform?: string
  ) => {
    const targetArch = overrideArchetype || archetype;
    const targetPlat = overridePlatform || targetPlatform;
    const currentSess = sessions[targetArch];
    const trimmed = promptText.trim();

    if (!trimmed || currentSess.revisions >= MAX_CHAT_TURNS || isChatLoading) return;

    const newHistory: { role: "user" | "ai"; content: string; modelUsed?: string }[] = [
      ...currentSess.history,
      { role: "user", content: trimmed },
    ];

    updateSession(targetArch, (prev) => ({
      ...prev,
      history: newHistory,
    }));
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          currentConfig: currentSess.config,
          revision: currentSess.revisions,
          selectedArchetype: targetArch,
          selectedPlatform: targetPlat,
          selectedModel,
        }),
      });
      const data = await res.json();

      const resolvedArch: Archetype =
        data.config?.archetype && ARCHETYPE_LIST.includes(data.config.archetype)
          ? data.config.archetype
          : targetArch;

      if (resolvedArch !== targetArch) {
        setArchetype(resolvedArch);
      }
      if (data.config?.targetPlatform) {
        setTargetPlatform(data.config.targetPlatform);
      }
      if (data.config?.repoUrl) {
        setUrl(data.config.repoUrl);
      }

      updateSession(resolvedArch, (prev) => ({
        history: [
          ...newHistory,
          {
            role: "ai",
            content: data.reply || "Configuration updated.",
            modelUsed: data.modelUsed,
          },
        ],
        revisions: currentSess.revisions + 1,
        config: data.config || prev.config,
        selectedTech: data.config?.technologies
          ? Array.from(new Set([...prev.selectedTech, ...data.config.technologies]))
          : prev.selectedTech,
      }));
    } catch {
      updateSession(targetArch, (prev) => ({
        ...prev,
        history: [
          ...newHistory,
          { role: "ai", content: "Request failed. Please retry or use Stack Composer." },
        ],
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitChatPrompt(chatInput);
  };

  const proceedFromChat = async () => {
    const chatConfig = activeSession.config;
    if (!chatConfig) return;
    const label = chatConfig.repoUrl || `${theme.name} Specification`;
    setRepoData(label, "");
    setStep(2);
    setStatus("analyzing");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: chatConfig.repoUrl || undefined,
          manualStack:
            activeSession.selectedTech.length > 0
              ? activeSession.selectedTech
              : [targetPlatform],
          archetype: chatConfig.archetype || archetype,
          targetPlatform: chatConfig.targetPlatform || targetPlatform,
          selectedModel,
        }),
      });
      if (!res.ok) throw new Error("Failed to analyze specification");
      const data = await res.json();
      setRepoData(label, data.repoContext);
      setInterrogationData(data.detectedStack, data.questions);
      setStatus("idle");
      setStep(3);
    } catch (err: any) {
      setStatus("error", err.message || "Failed to analyze specification");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ingestMode === "scan" && !url.includes("github.com/")) {
      setError("Enter a valid public GitHub repository URL (e.g., https://github.com/owner/repo).");
      return;
    }

    if (ingestMode === "manual" && manualTech.length === 0) {
      setError("Select at least one technology card to compose your stack.");
      return;
    }

    setError("");
    const label = ingestMode === "scan" ? url : `${targetPlatform} ${theme.shortLabel} Stack`;
    setRepoData(label, "");
    setStep(2);
    setStatus("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: ingestMode === "scan" ? url : undefined,
          manualStack: ingestMode === "manual" ? manualTech : undefined,
          archetype,
          targetPlatform,
          selectedModel,
        }),
      });

      if (!res.ok) {
        throw new Error("Repository analysis failed. Check that the repository is public.");
      }

      const data = await res.json();
      setRepoData(label, data.repoContext);
      setInterrogationData(data.detectedStack, data.questions);
      setStatus("idle");
      setStep(3);
    } catch (err: any) {
      setStatus("error", err.message || "Failed to analyze repository");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-3">
      {/* 1. Clean Generation Target Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        {ARCHETYPE_LIST.map((archId) => {
          const cardTheme = ARCHETYPE_THEMES[archId];
          const isSelected = archetype === archId;
          return (
            <button
              key={archId}
              type="button"
              onClick={() => handleArchetypeChange(archId)}
              className={`px-3.5 py-2.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? "bg-white/[0.06] border-white/[0.22] text-white"
                  : "bg-[#09090b] border-white/[0.07] text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200 hover:border-white/[0.14]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-100">{cardTheme.name}</span>
                <span className="font-mono text-[10px] text-zinc-500 truncate">
                  {cardTheme.artifact}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                {cardTheme.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Clean Platform & Model Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 py-2 px-3 rounded-lg bg-[#09090b] border border-white/[0.07] shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
            {currentPlatformConfig.label}:
          </span>
          {currentPlatformConfig.options.map((opt) => {
            const isSelected = targetPlatform === opt.name;
            return (
              <button
                key={opt.name}
                type="button"
                onClick={() => {
                  setTargetPlatform(opt.name);
                  setManualTech([]);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                  isSelected
                    ? "bg-zinc-100 text-zinc-950 border-zinc-100"
                    : "bg-zinc-900/60 border-white/[0.07] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15]"
                }`}
              >
                {opt.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
            Model:
          </span>
          {AI_MODEL_OPTIONS.map((modelOpt) => {
            const isSelected = selectedModel === modelOpt.id;
            return (
              <button
                key={modelOpt.id}
                type="button"
                onClick={() => setSelectedModel(modelOpt.id)}
                title={`${modelOpt.name} (${modelOpt.provider}) — ${modelOpt.description}`}
                className={`px-2 py-1 rounded font-mono text-[11px] border transition-colors ${
                  isSelected
                    ? "bg-white/[0.1] text-white border-white/[0.24]"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                }`}
              >
                {modelOpt.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Input Mode Segmented Control */}
      <div className="grid grid-cols-3 gap-1 bg-[#09090b] p-1 rounded-lg border border-white/[0.07] shrink-0">
        <button
          type="button"
          onClick={() => {
            setIngestMode("chat");
            setError("");
          }}
          className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            ingestMode === "chat"
              ? "bg-zinc-800/90 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Architect Chat
        </button>
        <button
          type="button"
          onClick={() => {
            setIngestMode("scan");
            setError("");
          }}
          className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            ingestMode === "scan"
              ? "bg-zinc-800/90 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          GitHub Repository
        </button>
        <button
          type="button"
          onClick={() => {
            setIngestMode("manual");
            setError("");
          }}
          className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            ingestMode === "manual"
              ? "bg-zinc-800/90 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Stack Composer
        </button>
      </div>

      {/* 4. Active Workspace */}
      {ingestMode === "chat" ? (
        <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] border border-white/[0.07] rounded-lg p-4">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium text-zinc-200 truncate">
                {theme.architectTitle}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                ({targetPlatform})
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-zinc-500">
                Turn {activeSession.revisions}/{MAX_CHAT_TURNS}
              </span>
              {activeSession.history.length > 0 ? (
                <button
                  type="button"
                  onClick={resetChatSession}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.07]"
                >
                  <RotateCcw size={11} />
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pb-2 text-xs min-h-0 pr-1">
            {activeSession.history.length === 0 ? (
              <div className="h-full flex flex-col justify-center py-2 space-y-4">
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium text-zinc-100">{theme.architectHeadline}</p>
                  <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
                    {theme.architectBrief}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto w-full">
                  {theme.starterPrompts.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setTargetPlatform(item.platform);
                        submitChatPrompt(item.prompt, archetype, item.platform);
                      }}
                      className="p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-white/[0.07] hover:border-white/[0.18] text-left transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                          {item.label}
                        </span>
                        <ArrowRight
                          size={12}
                          className="text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 leading-snug">
                        {item.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeSession.history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[88%] whitespace-pre-line leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white/[0.08] text-zinc-100 border border-white/[0.14]"
                      : "bg-zinc-900/80 text-zinc-200 border border-white/[0.07]"
                  }`}
                >
                  {msg.role === "ai" && msg.modelUsed ? (
                    <div className="font-mono text-[10px] text-zinc-500 mb-1">
                      {msg.modelUsed}
                    </div>
                  ) : null}
                  {msg.content}
                </div>
              </div>
            ))}

            {activeSession.config ? (
              <div className="mt-3 p-4 bg-zinc-900/50 border border-white/[0.12] rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
                  <div className="font-semibold text-xs text-zinc-100">
                    Extracted {theme.shortLabel} Specification
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">
                    Click tools to toggle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#09090b] p-2.5 rounded border border-white/[0.06] font-mono text-[11px]">
                  <div className="text-zinc-400">
                    target:{" "}
                    <span className="text-zinc-100 capitalize">
                      {activeSession.config.archetype || archetype} /{" "}
                      {activeSession.config.targetPlatform || targetPlatform}
                    </span>
                  </div>
                  {activeSession.config.repoUrl ? (
                    <div className="text-zinc-400 truncate">
                      repo: <span className="text-zinc-100">{activeSession.config.repoUrl}</span>
                    </div>
                  ) : (
                    <div className="text-zinc-500">repo: standalone specification</div>
                  )}
                </div>

                {activeSession.selectedTech.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      Selected Stack ({activeSession.selectedTech.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSession.selectedTech.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleChatTech(tech)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.08] text-zinc-100 border border-white/[0.15] text-[11px] hover:bg-white/[0.12] transition-colors"
                        >
                          <span>{tech}</span>
                          <Check size={11} className="text-zinc-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {activeSession.config.recommendations &&
                activeSession.config.recommendations.length > 0 ? (
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <div className="font-mono text-zinc-400 text-[10px] uppercase tracking-wider">
                      Recommended Tooling
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeSession.config.recommendations.map((rec) => {
                        const isAdded = activeSession.selectedTech.includes(rec.name);
                        return (
                          <button
                            key={rec.name}
                            type="button"
                            onClick={() => toggleChatTech(rec.name)}
                            className={`flex items-start gap-2.5 p-2.5 text-left rounded-lg border transition-colors ${
                              isAdded
                                ? "bg-white/[0.07] border-white/[0.22] text-white"
                                : "bg-[#09090b] hover:bg-zinc-900 border-white/[0.07]"
                            }`}
                          >
                            <div
                              className={`mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                isAdded
                                  ? "bg-zinc-100 border-zinc-100"
                                  : "border-zinc-600 bg-transparent"
                              }`}
                            >
                              {isAdded ? (
                                <Check size={10} className="text-zinc-950 stroke-[2.5]" />
                              ) : null}
                            </div>
                            <div className="w-6 h-6 rounded bg-zinc-900 border border-white/[0.07] flex items-center justify-center shrink-0">
                              <TechIcon
                                slug={rec.slug}
                                color={rec.color}
                                name={rec.name}
                                size={14}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-zinc-100 text-xs">{rec.name}</div>
                              <div className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                                {rec.reason}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {isChatLoading ? (
              <div className="font-mono text-zinc-400 animate-pulse text-[11px] pl-1">
                [{activeModelMeta.shortName}] {theme.loadingStatusText}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleChatSubmit}
            className="shrink-0 pt-3 border-t border-white/[0.07] flex gap-2"
          >
            <input
              type="text"
              aria-label="Describe your infrastructure or pipeline requirements"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                activeSession.revisions >= MAX_CHAT_TURNS
                  ? "Consultation complete — proceed to configuration or clear session."
                  : activeSession.history.length > 0
                    ? `Answer follow-up questions or refine ${theme.shortLabel} requirements...`
                    : theme.chatPlaceholder
              }
              disabled={activeSession.revisions >= MAX_CHAT_TURNS || isChatLoading}
              className="flex-1 bg-zinc-900 border border-white/[0.09] text-zinc-100 placeholder-zinc-500 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-white/[0.28] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              aria-label="Submit message"
              disabled={
                !chatInput.trim() || activeSession.revisions >= MAX_CHAT_TURNS || isChatLoading
              }
              className="px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <span>Send</span>
              <ArrowRight size={13} />
            </button>
          </form>

          {activeSession.config ? (
            <div className="mt-2.5 shrink-0 flex gap-2">
              <button
                type="button"
                onClick={resetChatSession}
                className="px-4 py-2 rounded-lg font-medium text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={proceedFromChat}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-xs text-zinc-950 bg-zinc-100 hover:bg-white transition-colors"
              >
                <span>Continue to Configuration</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 flex-1 overflow-hidden flex flex-col min-h-0"
        >
          {ingestMode === "scan" ? (
            <div className="flex-1 flex flex-col justify-between min-h-0 bg-[#09090b] border border-white/[0.07] rounded-lg p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="repo-url-input"
                    className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider"
                  >
                    Public GitHub Repository URL
                  </label>
                  <div className="relative">
                    <input
                      id="repo-url-input"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/owner/repository"
                      className="w-full bg-zinc-900 border border-white/[0.09] text-zinc-100 text-xs rounded-lg pl-9 pr-3.5 py-2.5 placeholder-zinc-500 focus:outline-none focus:border-white/[0.28] transition-colors font-mono"
                      required
                    />
                    <Globe
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                  </div>
                  {error ? <p className="text-xs text-red-400">{error}</p> : null}
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-mono text-zinc-500">
                    Sample repositories:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {theme.sampleRepos.map((sample) => {
                      const activeSample = url === sample.url;
                      return (
                        <button
                          key={sample.url}
                          type="button"
                          onClick={() => {
                            setUrl(sample.url);
                            setError("");
                          }}
                          className={`px-3 py-2 rounded-lg border text-left flex items-center justify-between gap-2 transition-colors ${
                            activeSample
                              ? "bg-white/[0.07] border-white/[0.22] text-white"
                              : "bg-zinc-900/60 hover:bg-zinc-900 border-white/[0.07] text-zinc-300"
                          }`}
                        >
                          <span className="font-mono text-[11px] truncate">{sample.label}</span>
                          <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                            {sample.note}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-zinc-900/50 border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed">
                {theme.scanInspectorNote}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 min-h-[120px] bg-[#09090b] border border-white/[0.07] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  {targetPlatform} Components ({manualTech.length} selected)
                </span>
                {manualTech.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setManualTech([])}
                    className="text-[11px] text-zinc-400 hover:text-white"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getTechOptions(archetype, targetPlatform).map((tech) => {
                  const isSelected = manualTech.includes(tech.name);
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => toggleManualTech(tech.name)}
                      className={`relative p-2.5 rounded-lg border flex items-center gap-2.5 text-left transition-all ${
                        isSelected
                          ? "bg-white/[0.08] border-white/[0.24] text-white"
                          : "bg-zinc-900/45 border-white/[0.07] text-zinc-300 hover:bg-zinc-900 hover:border-white/[0.15]"
                      }`}
                    >
                      <div className="w-7 h-7 rounded bg-zinc-950 border border-white/[0.07] flex items-center justify-center shrink-0">
                        <TechIcon iconKey={tech.iconKey} name={tech.name} size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-zinc-100 truncate">
                          {tech.name}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-500 truncate">
                          {tech.category}
                        </div>
                      </div>
                      {isSelected ? (
                        <Check size={12} className="text-zinc-200 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {error ? <p className="text-xs text-red-400 mt-3">{error}</p> : null}
            </div>
          )}

          <button
            type="submit"
            className="shrink-0 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs text-zinc-950 bg-zinc-100 hover:bg-white transition-colors"
          >
            <span>Continue with {targetPlatform}</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
