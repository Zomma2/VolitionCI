"use client";

import { useState } from "react";
import { useWizardStore, Archetype } from "@/store/useWizardStore";
import { ArrowRight, Globe, Search, Grip, Check, Layers, Server, Cpu, Box } from "lucide-react";

const ARCHETYPE_OPTIONS: { id: Archetype; title: string; subtitle: string; icon: any }[] = [
  { 
    id: "pipeline", 
    title: "CI/CD Pipeline", 
    subtitle: "Enterprise zero-trust delivery",
    icon: Cpu 
  },
  { 
    id: "terraform", 
    title: "Terraform Infrastructure", 
    subtitle: "Modular IaC & cloud topology",
    icon: Layers 
  },
  { 
    id: "kubernetes", 
    title: "Kubernetes Manifests", 
    subtitle: "Orchestration & scaling specs",
    icon: Server 
  },
  { 
    id: "docker", 
    title: "Docker Compose", 
    subtitle: "Multi-container local & dev specs",
    icon: Box 
  },
];

const PLATFORM_CONFIG: Record<Archetype, { label: string; options: string[]; default: string }> = {
  pipeline: {
    label: "Target CI/CD Provider",
    options: ["GitHub Actions", "GitLab CI", "Bitbucket Pipelines", "CircleCI", "Jenkins"],
    default: "GitHub Actions",
  },
  terraform: {
    label: "Target Cloud Platform",
    options: ["AWS", "Azure", "Google Cloud", "DigitalOcean"],
    default: "AWS",
  },
  kubernetes: {
    label: "Target Cluster Environment",
    options: ["Generic Kubernetes", "Amazon EKS", "Google GKE", "Azure AKS", "Minikube / Local"],
    default: "Generic Kubernetes",
  },
  docker: {
    label: "Target Environment",
    options: ["Local Development", "Production Swarm", "Testing / CI"],
    default: "Local Development",
  },
};

const TECH_OPTIONS_MAP: Record<Archetype, { id: string; name: string; slug: string; color: string; whiteInvert?: boolean; customUrl?: string }[]> = {
  pipeline: [
    { id: "react", name: "React", slug: "react", color: "61DAFB" },
    { id: "nextjs", name: "Next.js", slug: "nextdotjs", color: "000000", whiteInvert: true },
    { id: "node", name: "Node.js", slug: "nodedotjs", color: "339933" },
    { id: "python", name: "Python", slug: "python", color: "3776AB" },
    { id: "go", name: "Go", slug: "go", color: "00ADD8" },
    { id: "java", name: "Java", slug: "java", color: "ED8B00", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
    { id: "postgres", name: "PostgreSQL", slug: "postgresql", color: "4169E1" },
    { id: "mysql", name: "MySQL", slug: "mysql", color: "4479A1" },
    { id: "mongo", name: "MongoDB", slug: "mongodb", color: "47A248" },
    { id: "redis", name: "Redis", slug: "redis", color: "DC382D" },
    { id: "docker", name: "Docker", slug: "docker", color: "2496ED" },
    { id: "k8s", name: "Kubernetes", slug: "kubernetes", color: "326CE5" },
    { id: "aws", name: "AWS", slug: "amazonwebservices", color: "232F3E", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
    { id: "gcp", name: "GCP", slug: "googlecloud", color: "4285F4" },
    { id: "azure", name: "Azure", slug: "microsoftazure", color: "0078D4", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg" },
    { id: "terraform", name: "Terraform", slug: "terraform", color: "844FBA" }
  ],
  terraform: [
    { id: "aws", name: "AWS", slug: "amazonwebservices", color: "232F3E", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
    { id: "s3", name: "AWS S3", slug: "amazons3", color: "569A31", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original.svg" },
    { id: "dynamodb", name: "DynamoDB", slug: "amazondynamodb", color: "4053D6", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original.svg" },
    { id: "vpc", name: "AWS VPC", slug: "amazonvpc", color: "7AA116", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original.svg" },
    { id: "ecs", name: "AWS ECS", slug: "amazonecs", color: "FF9900", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original.svg" },
    { id: "eks", name: "AWS EKS", slug: "amazoneks", color: "FF9900", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original.svg" },
    { id: "iam", name: "AWS IAM", slug: "amazoniam", color: "DD344C", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original.svg" },
    { id: "azure", name: "Azure", slug: "microsoftazure", color: "0078D4", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg" },
    { id: "azureblob", name: "Azure Blob", slug: "azure", color: "0078D4", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg" },
    { id: "gcp", name: "GCP", slug: "googlecloud", color: "4285F4" },
    { id: "terraform", name: "Terraform", slug: "terraform", color: "844FBA" },
    { id: "docker", name: "Docker", slug: "docker", color: "2496ED" }
  ],
  kubernetes: [
    { id: "k8s", name: "Kubernetes", slug: "kubernetes", color: "326CE5" },
    { id: "helm", name: "Helm", slug: "helm", color: "0F1689" },
    { id: "kustomize", name: "Kustomize", slug: "kustomize", color: "326CE5" },
    { id: "nginx", name: "Ingress-Nginx", slug: "nginx", color: "009639" },
    { id: "traefik", name: "Traefik", slug: "traefikmesh", color: "24A1C1" },
    { id: "prometheus", name: "Prometheus", slug: "prometheus", color: "E6522C" },
    { id: "grafana", name: "Grafana", slug: "grafana", color: "F46800" },
    { id: "istio", name: "Istio", slug: "istio", color: "466BB0" },
    { id: "linkerd", name: "Linkerd", slug: "linkerd", color: "17203A" },
    { id: "certmanager", name: "Cert-Manager", slug: "letsecnrypt", color: "003A70", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg" },
    { id: "argo", name: "ArgoCD", slug: "argo", color: "EF7B4D" },
    { id: "docker", name: "Docker", slug: "docker", color: "2496ED" }
  ],
  docker: [
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
    { id: "java", name: "Java", slug: "java", color: "ED8B00", customUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
    { id: "elasticsearch", name: "Elasticsearch", slug: "elasticsearch", color: "005571" }
  ]
};

export default function Step1Ingest() {
  const { archetype, targetPlatform, setArchetype, setTargetPlatform, setRepoData, setStatus, setStep, setInterrogationData } = useWizardStore();
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [url, setUrl] = useState("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [error, setError] = useState("");

  const currentPlatformConfig = PLATFORM_CONFIG[archetype];

  const handleArchetypeChange = (newArchetype: Archetype) => {
    setArchetype(newArchetype);
    setTargetPlatform(PLATFORM_CONFIG[newArchetype].default);
    setSelectedTech([]);
  };

  const toggleTech = (name: string) => {
    setSelectedTech(prev => 
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "scan" && !url.includes("github.com/")) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    
    if (mode === "manual" && selectedTech.length === 0) {
      setError("Please select at least one technology.");
      return;
    }
    
    setError("");
    
    setRepoData(mode === "scan" ? url : "Manual Config", "");
    setStep(2);
    setStatus("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: mode === "scan" ? url : undefined,
          manualStack: mode === "manual" ? selectedTech : undefined,
          archetype,
          targetPlatform,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze repository");
      }

      const data = await res.json();
      setRepoData(mode === "scan" ? url : "Manual Configuration", data.repoContext);
      setInterrogationData(data.detectedStack, data.questions);
      setStatus("idle");
      setStep(3);
    } catch (err: any) {
      setStatus("error", err.message || "Failed to analyze repository");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-4">
      {/* ── Top Archetype Tabs ── */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Generation Target</h2>
          <span className="text-[10px] uppercase font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
            Phase 3 IaC Ready
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ARCHETYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = archetype === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleArchetypeChange(opt.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected 
                    ? "bg-violet-600/15 border-violet-500/50 text-white shadow-sm" 
                    : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon size={16} className={isSelected ? "text-violet-400" : "text-white/40"} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                </div>
                <div>
                  <div className="text-xs font-semibold">{opt.title}</div>
                  <div className="text-[10px] text-white/40 leading-tight truncate">{opt.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mode Selection: Scan vs Manual ── */}
      <div className="flex bg-white/[0.04] p-1 rounded-xl shrink-0">
        <button
          type="button"
          onClick={() => { setMode("scan"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-lg transition-all ${mode === "scan" ? "bg-white/10 text-white shadow" : "text-white/40 hover:text-white/70"}`}
        >
          <Search size={13} /> Scan Repository
        </button>
        <button
          type="button"
          onClick={() => { setMode("manual"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-lg transition-all ${mode === "manual" ? "bg-white/10 text-white shadow" : "text-white/40 hover:text-white/70"}`}
        >
          <Grip size={13} /> Manual Selection
        </button>
      </div>

      {/* ── Form Body ── */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
        {mode === "scan" ? (
          <div className="space-y-2 shrink-0">
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              GitHub Repository URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/facebook/react"
                className="w-full bg-white/[0.04] border border-white/[0.07] text-white text-xs rounded-xl px-9 py-2.5 placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                required={mode === "scan"}
              />
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[120px]">
            <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-2">
              Select Technologies
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TECH_OPTIONS_MAP[archetype].map((tech) => {
                const isSelected = selectedTech.includes(tech.name);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTech(tech.name)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected 
                        ? "bg-violet-500/10 border-violet-500/40 text-violet-100" 
                        : "bg-white/[0.02] border-white/[0.05] text-white/60 hover:bg-white/[0.06] hover:border-white/[0.1]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-violet-500 rounded-full flex items-center justify-center">
                        <Check size={8} className="text-white" />
                      </div>
                    )}
                    <img 
                      src={tech.customUrl || `https://cdn.simpleicons.org/${tech.slug}/${tech.whiteInvert ? "white" : tech.color}`} 
                      alt={tech.name}
                      width={20}
                      height={20}
                      className={`opacity-80 transition-opacity ${isSelected ? "opacity-100" : ""}`}
                    />
                    <span className="text-[11px] font-medium truncate max-w-full">{tech.name}</span>
                  </button>
                );
              })}
            </div>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>
        )}

        {/* ── Dynamic Target Platform Dropdown ── */}
        <div className="space-y-2 shrink-0">
          <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            {currentPlatformConfig.label}
          </label>
          <select
            value={targetPlatform}
            onChange={(e) => setTargetPlatform(e.target.value)}
            className="w-full appearance-none bg-white/[0.04] border border-white/[0.07] text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
            style={{ colorScheme: "dark" }}
          >
            {currentPlatformConfig.options.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="shrink-0 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          Proceed to Analysis <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
}
