"use client";

import { useEffect, useState } from "react";
import { useWizardStore, Archetype } from "@/store/useWizardStore";
import {
  ArrowRight,
  Box,
  Check,
  Cpu,
  Globe,
  Grip,
  Layers,
  MessageSquare,
  RotateCcw,
  Search,
  Server,
  Terminal,
} from "lucide-react";

const MAX_CHAT_TURNS = 3;

const ARCHETYPE_OPTIONS: {
  id: Archetype;
  title: string;
  subtitle: string;
  artifact: string;
  icon: typeof Cpu;
}[] = [
  {
    id: "pipeline",
    title: "CI/CD Pipeline",
    subtitle: "Zero-trust build, SAST & rollout",
    artifact: ".github/workflows/*.yml",
    icon: Cpu,
  },
  {
    id: "terraform",
    title: "Terraform HCL",
    subtitle: "Modular cloud topology & state",
    artifact: "infra/main.tf",
    icon: Layers,
  },
  {
    id: "kubernetes",
    title: "Kubernetes",
    subtitle: "Workloads, HPA & NetworkPolicy",
    artifact: "k8s/manifests.yaml",
    icon: Server,
  },
  {
    id: "docker",
    title: "Docker Compose",
    subtitle: "Multi-container isolated stacks",
    artifact: "docker-compose.yml",
    icon: Box,
  },
];

const PLATFORM_CONFIG: Record<Archetype, { label: string; options: string[]; default: string }> = {
  pipeline: {
    label: "Target CI/CD Provider",
    options: ["GitHub Actions", "GitLab CI", "Bitbucket Pipelines", "CircleCI", "Jenkins"],
    default: "GitHub Actions",
  },
  terraform: {
    label: "Target Cloud Provider",
    options: ["AWS", "Google Cloud", "Azure", "DigitalOcean"],
    default: "AWS",
  },
  kubernetes: {
    label: "Target Cluster Distribution",
    options: ["Generic Kubernetes", "Amazon EKS", "Google GKE", "Azure AKS", "Minikube / Local"],
    default: "Generic Kubernetes",
  },
  docker: {
    label: "Target Runtime Profile",
    options: ["Local Development", "Production Swarm", "Testing / CI"],
    default: "Local Development",
  },
};

const STARTER_PROMPTS: { label: string; archetype: Archetype; prompt: string }[] = [
  {
    label: "Next.js + Prisma -> AWS ECS",
    archetype: "pipeline",
    prompt:
      "Build a GitHub Actions pipeline for a Next.js and Prisma PostgreSQL app deploying to AWS ECS with OIDC auth, Semgrep, and Trivy.",
  },
  {
    label: "Multi-AZ AWS VPC + RDS",
    archetype: "terraform",
    prompt:
      "Provision an AWS Terraform setup with S3 state locking, 3-AZ VPC, private subnets, KMS encryption, and Multi-AZ RDS PostgreSQL 16.",
  },
  {
    label: "Hardened EKS Microservice",
    archetype: "kubernetes",
    prompt:
      "Generate hardened Kubernetes manifests on Amazon EKS for a Go API with non-root PodSecurity, HPA v2 autoscaling, and NetworkPolicy.",
  },
  {
    label: "Polyglot Go + Postgres + Redis",
    archetype: "docker",
    prompt:
      "Create a Docker Compose stack with Nginx reverse proxy, Node.js web app, Go API worker, PostgreSQL 16, and Redis 7 with healthchecks.",
  },
];

const SAMPLE_REPOS = [
  { label: "Zomma2/VolitionCI", url: "https://github.com/Zomma2/VolitionCI" },
  { label: "vercel/next.js", url: "https://github.com/vercel/next.js" },
  { label: "hashicorp/terraform", url: "https://github.com/hashicorp/terraform" },
  {
    label: "fastapi/full-stack-fastapi-template",
    url: "https://github.com/fastapi/full-stack-fastapi-template",
  },
];

interface TechOption {
  id: string;
  name: string;
  slug: string;
  color: string;
  customUrl?: string;
  whiteInvert?: boolean;
}

const getTechOptions = (archetype: Archetype, platform: string): TechOption[] => {
  const commonIac: TechOption[] = [
    { id: "terraform", name: "Terraform", slug: "terraform", color: "844FBA" },
    { id: "docker", name: "Docker", slug: "docker", color: "2496ED" },
  ];

  const awsIcon =
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg";
  const azureIcon =
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg";
  const javaIcon =
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg";

  const awsTf: TechOption[] = [
    { id: "vpc", name: "AWS VPC", slug: "amazonvpc", color: "FF9900", customUrl: awsIcon },
    { id: "eks", name: "AWS EKS", slug: "amazoneks", color: "FF9900", customUrl: awsIcon },
    { id: "ecs", name: "AWS ECS", slug: "amazonecs", color: "FF9900", customUrl: awsIcon },
    { id: "rds", name: "AWS RDS", slug: "amazonrds", color: "527FFF", customUrl: awsIcon },
    { id: "s3", name: "AWS S3", slug: "amazons3", color: "569A31", customUrl: awsIcon },
    { id: "dynamodb", name: "DynamoDB", slug: "amazondynamodb", color: "4053D6", customUrl: awsIcon },
    { id: "lambda", name: "AWS Lambda", slug: "awslambda", color: "FF9900", customUrl: awsIcon },
    { id: "iam", name: "AWS IAM", slug: "amazoniam", color: "DD344C", customUrl: awsIcon },
    { id: "ecr", name: "AWS ECR", slug: "amazonecr", color: "FF9900", customUrl: awsIcon },
    { id: "cloudfront", name: "CloudFront", slug: "amazoncloudfront", color: "8C4FFF", customUrl: awsIcon },
    { id: "elasticache", name: "ElastiCache", slug: "amazonelasticache", color: "C925D1", customUrl: awsIcon },
    { id: "secretsmanager", name: "Secrets Manager", slug: "awssecretsmanager", color: "DD344C", customUrl: awsIcon },
  ];

  const azureTf: TechOption[] = [
    { id: "azure", name: "Azure VNet", slug: "microsoftazure", color: "0078D4", customUrl: azureIcon },
    { id: "azureaks", name: "Azure AKS", slug: "azure", color: "0078D4", customUrl: azureIcon },
    { id: "azuresql", name: "Azure SQL", slug: "azure", color: "0078D4", customUrl: azureIcon },
    { id: "azureblob", name: "Blob Storage", slug: "azure", color: "0078D4", customUrl: azureIcon },
  ];

  const gcpTf: TechOption[] = [
    { id: "gcp", name: "Cloud VPC", slug: "googlecloud", color: "4285F4" },
    { id: "cloudrun", name: "Cloud Run", slug: "googlecloud", color: "4285F4" },
    { id: "gke", name: "Google GKE", slug: "googlecloud", color: "4285F4" },
    { id: "gcs", name: "Cloud Storage", slug: "googlecloud", color: "4285F4" },
  ];

  const doTf: TechOption[] = [
    { id: "digitalocean", name: "Droplets & VPC", slug: "digitalocean", color: "0080FF" },
    { id: "doks", name: "DOKS Cluster", slug: "digitalocean", color: "0080FF" },
    { id: "spaces", name: "DO Spaces", slug: "digitalocean", color: "0080FF" },
  ];

  if (archetype === "terraform") {
    if (platform === "AWS") return [...awsTf, ...commonIac];
    if (platform === "Azure") return [...azureTf, ...commonIac];
    if (platform === "Google Cloud") return [...gcpTf, ...commonIac];
    if (platform === "DigitalOcean") return [...doTf, ...commonIac];
    return [...awsTf, ...commonIac];
  }

  if (archetype === "kubernetes") {
    const k8sCommon: TechOption[] = [
      { id: "k8s", name: "Kubernetes", slug: "kubernetes", color: "326CE5" },
      { id: "helm", name: "Helm", slug: "helm", color: "0F1689", whiteInvert: true },
      { id: "kustomize", name: "Kustomize", slug: "kubernetes", color: "326CE5" },
      { id: "nginx", name: "Ingress-Nginx", slug: "nginx", color: "009639" },
      { id: "traefik", name: "Traefik", slug: "traefikproxy", color: "24A1C1" },
      { id: "prometheus", name: "Prometheus", slug: "prometheus", color: "E6522C" },
      { id: "grafana", name: "Grafana", slug: "grafana", color: "F46800" },
      { id: "istio", name: "Istio", slug: "istio", color: "466BB0" },
      { id: "argo", name: "ArgoCD", slug: "argo", color: "EF7B4D" },
      { id: "docker", name: "Docker", slug: "docker", color: "2496ED" },
    ];
    if (platform === "Amazon EKS")
      return [{ id: "aws", name: "AWS EKS", slug: "amazonwebservices", color: "FF9900", customUrl: awsIcon }, ...k8sCommon];
    if (platform === "Azure AKS")
      return [{ id: "azure", name: "Azure AKS", slug: "microsoftazure", color: "0078D4", customUrl: azureIcon }, ...k8sCommon];
    if (platform === "Google GKE")
      return [{ id: "gcp", name: "Google GKE", slug: "googlecloud", color: "4285F4" }, ...k8sCommon];
    return k8sCommon;
  }

  if (archetype === "pipeline") {
    return [
      { id: "nextjs", name: "Next.js", slug: "nextdotjs", color: "000000", whiteInvert: true },
      { id: "react", name: "React", slug: "react", color: "61DAFB" },
      { id: "node", name: "Node.js", slug: "nodedotjs", color: "339933" },
      { id: "python", name: "Python", slug: "python", color: "3776AB" },
      { id: "go", name: "Go", slug: "go", color: "00ADD8" },
      { id: "java", name: "Java", slug: "java", color: "ED8B00", customUrl: javaIcon },
      { id: "postgres", name: "PostgreSQL", slug: "postgresql", color: "4169E1" },
      { id: "redis", name: "Redis", slug: "redis", color: "DC382D" },
      { id: "prisma", name: "Prisma", slug: "prisma", color: "2D3748", whiteInvert: true },
      { id: "docker", name: "Docker", slug: "docker", color: "2496ED" },
      { id: "trivy", name: "Trivy", slug: "aquasecurity", color: "1904DA" },
      { id: "k8s", name: "Kubernetes", slug: "kubernetes", color: "326CE5" },
    ];
  }

  return [
    { id: "docker", name: "Docker", slug: "docker", color: "2496ED" },
    { id: "postgres", name: "PostgreSQL", slug: "postgresql", color: "4169E1" },
    { id: "mysql", name: "MySQL", slug: "mysql", color: "4479A1" },
    { id: "mongo", name: "MongoDB", slug: "mongodb", color: "47A248" },
    { id: "redis", name: "Redis", slug: "redis", color: "DC382D" },
    { id: "rabbitmq", name: "RabbitMQ", slug: "rabbitmq", color: "FF6600" },
    { id: "nginx", name: "Nginx", slug: "nginx", color: "009639" },
    { id: "node", name: "Node.js", slug: "nodedotjs", color: "339933" },
    { id: "python", name: "Python", slug: "python", color: "3776AB" },
    { id: "go", name: "Go", slug: "go", color: "00ADD8" },
    { id: "java", name: "Java", slug: "java", color: "ED8B00", customUrl: javaIcon },
    { id: "elasticsearch", name: "Elasticsearch", slug: "elasticsearch", color: "005571" },
  ];
};

function ToolIcon({
  slug,
  color,
  name,
}: {
  slug: string;
  color: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !slug) {
    return (
      <div className="w-5 h-5 rounded bg-zinc-800 border border-white/[0.08] flex items-center justify-center shrink-0">
        <Box size={11} className="text-zinc-400" />
      </div>
    );
  }
  const cleanHex = (color || "38BDF8").replace("#", "");
  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${cleanHex}`}
      width={18}
      height={18}
      alt={name}
      onError={() => setFailed(true)}
      className="mt-0.5 opacity-90 shrink-0"
    />
  );
}

export default function Step1Ingest() {
  const {
    archetype,
    targetPlatform,
    ingestMode,
    presetPrompt,
    setIngestMode,
    setPresetPrompt,
    setArchetype,
    setTargetPlatform,
    setRepoData,
    setStatus,
    setStep,
    setInterrogationData,
  } = useWizardStore();

  const [url, setUrl] = useState("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [error, setError] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [chatRevisions, setChatRevisions] = useState(0);
  const [chatConfig, setChatConfig] = useState<{
    repoUrl?: string;
    archetype?: Archetype;
    targetPlatform?: string;
    technologies?: string[];
    recommendations?: { name: string; slug: string; color: string; reason: string }[];
  } | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    if (presetPrompt) {
      setChatInput(presetPrompt);
      setPresetPrompt("");
    }
  }, [presetPrompt, setPresetPrompt]);

  const currentPlatformConfig = PLATFORM_CONFIG[archetype];

  const handleArchetypeChange = (newArchetype: Archetype) => {
    setArchetype(newArchetype);
    setTargetPlatform(PLATFORM_CONFIG[newArchetype].default);
    setSelectedTech([]);
  };

  const toggleTech = (name: string) => {
    setSelectedTech((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const resetChatSession = () => {
    setChatHistory([]);
    setChatRevisions(0);
    setChatConfig(null);
    setChatInput("");
    setSelectedTech([]);
  };

  const submitChatPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || chatRevisions >= MAX_CHAT_TURNS || isChatLoading) return;

    const newHistory: { role: "user" | "ai"; content: string }[] = [
      ...chatHistory,
      { role: "user", content: trimmed },
    ];
    setChatHistory(newHistory);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          currentConfig: chatConfig,
          revision: chatRevisions,
        }),
      });
      const data = await res.json();
      if (data.config) {
        setChatConfig(data.config);
        if (data.config.archetype) setArchetype(data.config.archetype);
        if (data.config.targetPlatform) setTargetPlatform(data.config.targetPlatform);
        if (data.config.repoUrl) setUrl(data.config.repoUrl);
        if (data.config.technologies) {
          setSelectedTech((prev) =>
            Array.from(new Set([...prev, ...data.config.technologies]))
          );
        }
      }
      setChatHistory([
        ...newHistory,
        { role: "ai", content: data.reply || "Configuration updated." },
      ]);
      setChatRevisions((prev) => prev + 1);
    } catch {
      setChatHistory([
        ...newHistory,
        { role: "ai", content: "Request failed. Please retry or use Manual Stack Composer." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitChatPrompt(chatInput);
  };

  const proceedFromChat = async () => {
    if (!chatConfig) return;
    const label = chatConfig.repoUrl || `${chatConfig.archetype || archetype} Specification`;
    setRepoData(label, "");
    setStep(2);
    setStatus("analyzing");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: chatConfig.repoUrl || undefined,
          manualStack: selectedTech.length > 0 ? selectedTech : [targetPlatform],
          archetype: chatConfig.archetype || archetype,
          targetPlatform: chatConfig.targetPlatform || targetPlatform,
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

    if (ingestMode === "manual" && selectedTech.length === 0) {
      setError("Select at least one technology card to compose your stack.");
      return;
    }

    setError("");
    const label = ingestMode === "scan" ? url : `${targetPlatform} Stack`;
    setRepoData(label, "");
    setStep(2);
    setStatus("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: ingestMode === "scan" ? url : undefined,
          manualStack: ingestMode === "manual" ? selectedTech : undefined,
          archetype,
          targetPlatform,
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
    <div className="flex flex-col h-full overflow-hidden space-y-4">
      {/* Archetype Target Cards */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
            Select Generation Target
          </h2>
          <span className="font-mono text-[10px] text-zinc-400">
            YAML &amp; HCL Deterministic Validation
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {ARCHETYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = archetype === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleArchetypeChange(opt.id)}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? "bg-cyan-400/[0.08] border-cyan-400/45 text-white"
                    : "bg-[#090b0f]/70 border-white/[0.07] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 hover:border-white/[0.14]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={15} className={isSelected ? "text-cyan-400" : "text-zinc-500"} />
                  <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[120px]">
                    {opt.artifact}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-100">{opt.title}</div>
                  <div className="text-[11px] text-zinc-500 leading-tight truncate mt-0.5">
                    {opt.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-[#090b0f] p-1 rounded-lg border border-white/[0.07] shrink-0">
        <button
          type="button"
          onClick={() => {
            setIngestMode("chat");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            ingestMode === "chat"
              ? "bg-zinc-800 text-white border border-white/[0.08]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <MessageSquare size={13} className={ingestMode === "chat" ? "text-cyan-400" : ""} />
          <span>Consultative AI</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setIngestMode("scan");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            ingestMode === "scan"
              ? "bg-zinc-800 text-white border border-white/[0.08]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Search size={13} className={ingestMode === "scan" ? "text-cyan-400" : ""} />
          <span>Scan GitHub Repo</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setIngestMode("manual");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
            ingestMode === "manual"
              ? "bg-zinc-800 text-white border border-white/[0.08]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Grip size={13} className={ingestMode === "manual" ? "text-cyan-400" : ""} />
          <span>Stack Composer</span>
        </button>
      </div>

      {/* Mode Content */}
      {ingestMode === "chat" ? (
        <div className="flex-1 flex flex-col min-h-0 bg-[#090b0f] border border-white/[0.07] rounded-lg p-4">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <Terminal size={13} className="text-cyan-400" />
              <span className="text-xs font-medium text-zinc-200">
                Consultative Infrastructure Architect
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.07] text-zinc-400">
                Turn {chatRevisions}/{MAX_CHAT_TURNS}
              </span>
              {chatHistory.length > 0 ? (
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
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col justify-center py-4 space-y-4">
                <div className="space-y-1 text-center">
                  <p className="text-sm font-semibold text-zinc-100">
                    Describe your application architecture or deployment target
                  </p>
                  <p className="text-xs text-zinc-400 max-w-lg mx-auto">
                    The architect extracts your target stack, identifies missing security or state
                    constraints, and recommends production tooling before synthesis.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto w-full pt-1">
                  {STARTER_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        handleArchetypeChange(item.archetype);
                        submitChatPrompt(item.prompt);
                      }}
                      className="p-3 rounded-lg bg-zinc-900/70 hover:bg-zinc-900 border border-white/[0.07] hover:border-cyan-400/35 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 transition-colors">
                          {item.label}
                        </span>
                        <ArrowRight
                          size={12}
                          className="text-zinc-600 group-hover:text-cyan-400 transition-colors"
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

            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[88%] whitespace-pre-line leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cyan-400/10 text-zinc-100 border border-cyan-400/30"
                      : "bg-zinc-900/90 text-zinc-200 border border-white/[0.08]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {chatConfig ? (
              <div className="mt-3 p-4 bg-zinc-900/60 border border-cyan-400/25 rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
                  <div className="font-semibold text-cyan-300 text-xs">
                    Extracted Architecture Draft
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">
                    Toggle recommended tools below
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#090b0f] p-2.5 rounded-md border border-white/[0.06] font-mono text-[11px]">
                  <div className="text-zinc-400">
                    target:{" "}
                    <span className="text-zinc-100 capitalize">
                      {chatConfig.archetype} / {chatConfig.targetPlatform}
                    </span>
                  </div>
                  {chatConfig.repoUrl ? (
                    <div className="text-zinc-400 truncate">
                      repo: <span className="text-zinc-100">{chatConfig.repoUrl}</span>
                    </div>
                  ) : (
                    <div className="text-zinc-500">repo: standalone specification</div>
                  )}
                </div>

                {chatConfig.technologies && chatConfig.technologies.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                      Active Stack ({selectedTech.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTech.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-400/10 text-cyan-200 rounded border border-cyan-400/25 text-[11px] hover:bg-cyan-400/15 transition-colors"
                        >
                          <Check size={11} className="text-cyan-400" />
                          <span>{tech}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {chatConfig.recommendations && chatConfig.recommendations.length > 0 ? (
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <div className="font-mono font-semibold text-zinc-400 text-[10px] uppercase tracking-wider">
                      Recommended Security &amp; Infra Tooling
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {chatConfig.recommendations.map((rec) => {
                        const isAdded = selectedTech.includes(rec.name);
                        return (
                          <button
                            key={rec.name}
                            type="button"
                            onClick={() => toggleTech(rec.name)}
                            className={`flex items-start gap-2.5 p-2.5 text-left rounded-lg border transition-colors ${
                              isAdded
                                ? "bg-cyan-400/[0.08] border-cyan-400/35"
                                : "bg-[#090b0f]/80 hover:bg-zinc-900 border-white/[0.07]"
                            }`}
                          >
                            <div
                              className={`mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                isAdded
                                  ? "bg-cyan-400 border-cyan-400"
                                  : "border-zinc-600 bg-transparent"
                              }`}
                            >
                              {isAdded ? (
                                <Check size={10} className="text-zinc-950 stroke-[2.5]" />
                              ) : null}
                            </div>
                            <ToolIcon slug={rec.slug} color={rec.color} name={rec.name} />
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
              <div className="font-mono text-cyan-400 animate-pulse text-[11px] pl-1">
                Evaluating specification and formulating architectural guidance...
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
                chatRevisions >= MAX_CHAT_TURNS
                  ? "Consultation turns complete — proceed to interrogation or clear session."
                  : chatHistory.length > 0
                    ? "Answer follow-up questions or refine stack requirements..."
                    : "e.g., Deploy a Go + PostgreSQL API to Amazon EKS with GitHub Actions and Trivy..."
              }
              disabled={chatRevisions >= MAX_CHAT_TURNS || isChatLoading}
              className="flex-1 bg-zinc-900 border border-white/[0.09] text-zinc-100 placeholder-zinc-500 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-cyan-400/60 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              aria-label="Submit message"
              disabled={!chatInput.trim() || chatRevisions >= MAX_CHAT_TURNS || isChatLoading}
              className="px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <span>Send</span>
              <ArrowRight size={13} />
            </button>
          </form>

          {chatConfig ? (
            <div className="mt-2.5 shrink-0 flex gap-2">
              <button
                type="button"
                onClick={resetChatSession}
                className="px-4 py-2.5 rounded-lg font-medium text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={proceedFromChat}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
              >
                <span>Proceed to Architectural Interrogation</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0"
        >
          {/* Card-Based Platform Selector (replaces select dropdown) */}
          <div className="space-y-2 shrink-0">
            <span className="block text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
              {currentPlatformConfig.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {currentPlatformConfig.options.map((opt) => {
                const isSelected = targetPlatform === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setTargetPlatform(opt);
                      setSelectedTech([]);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-cyan-400/15 border-cyan-400/50 text-cyan-200"
                        : "bg-[#090b0f] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.16]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {ingestMode === "scan" ? (
            <div className="flex-1 flex flex-col justify-between min-h-0 bg-[#090b0f] border border-white/[0.07] rounded-lg p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="repo-url-input"
                    className="block text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider"
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
                      className="w-full bg-zinc-900 border border-white/[0.09] text-zinc-100 text-xs rounded-lg pl-9 pr-3.5 py-2.5 placeholder-zinc-500 focus:outline-none focus:border-cyan-400/60 transition-colors font-mono"
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
                    Quick-load a public repository to test tree inspection:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_REPOS.map((sample) => (
                      <button
                        key={sample.url}
                        type="button"
                        onClick={() => {
                          setUrl(sample.url);
                          setError("");
                        }}
                        className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] font-mono text-[11px] text-zinc-300 hover:text-cyan-300 transition-colors"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-zinc-900/60 border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed">
                VolitionCI inspects the repository recursive Git tree (`package.json`, `go.mod`,
                `requirements.txt`, `Dockerfile`, `.tf`, `helm`) via the GitHub REST API without
                cloning source code to disk.
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 min-h-[120px] bg-[#090b0f] border border-white/[0.07] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                  Select Stack Components ({selectedTech.length} selected)
                </span>
                {selectedTech.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSelectedTech([])}
                    className="text-[11px] text-zinc-400 hover:text-white"
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getTechOptions(archetype, targetPlatform).map((tech) => {
                  const isSelected = selectedTech.includes(tech.name);
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => toggleTech(tech.name)}
                      className={`relative p-2.5 rounded-lg border flex items-center gap-2.5 text-left transition-all ${
                        isSelected
                          ? "bg-cyan-400/10 border-cyan-400/45 text-white"
                          : "bg-zinc-900/50 border-white/[0.07] text-zinc-300 hover:bg-zinc-900 hover:border-white/[0.15]"
                      }`}
                    >
                      <img
                        src={
                          tech.customUrl ||
                          `https://cdn.simpleicons.org/${tech.slug}/${
                            tech.whiteInvert ? "white" : tech.color
                          }`
                        }
                        alt={tech.name}
                        width={18}
                        height={18}
                        className="shrink-0 object-contain"
                      />
                      <span className="text-xs font-medium truncate flex-1">{tech.name}</span>
                      {isSelected ? (
                        <Check size={12} className="text-cyan-400 shrink-0" />
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
            className="shrink-0 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
          >
            <span>Analyze &amp; Configure Stack</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
