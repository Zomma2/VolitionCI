"use client";

import { useWizardStore } from "@/store/useWizardStore";
import { ShieldCheck, ArrowRight, ArrowLeft, Check, Box, Layers, Server } from "lucide-react";

// Dictionary mapping common tools & infrastructure concepts to their canonical domains for Favicon resolution
const TOOL_DOMAINS: Record<string, string> = {
  // DevSecOps
  "trivy": "aquasec.com",
  "cosign": "sigstore.dev",
  "trufflehog": "trufflesecurity.com",
  "gitleaks": "gitleaks.io",
  "semgrep": "semgrep.dev",
  "sonarqube": "sonarqube.org",
  "checkov": "checkov.io",
  "syft": "anchore.com",
  "snyk": "snyk.io",
  "dependabot": "github.com",

  // IaC & Cloud Providers
  "terraform": "hashicorp.com",
  "opentofu": "opentofu.org",
  "aws": "amazon.com",
  "s3": "aws.amazon.com",
  "dynamodb": "aws.amazon.com",
  "ecs": "aws.amazon.com",
  "eks": "aws.amazon.com",
  "azure": "microsoft.com",
  "blob": "azure.microsoft.com",
  "gcp": "cloud.google.com",
  "gcs": "cloud.google.com",
  "digitalocean": "digitalocean.com",

  // Kubernetes & Ingress & Tooling
  "kubernetes": "kubernetes.io",
  "k8s": "kubernetes.io",
  "ingress-nginx": "kubernetes.github.io",
  "nginx": "nginx.org",
  "traefik": "traefik.io",
  "istio": "istio.io",
  "linkerd": "linkerd.io",
  "helm": "helm.sh",
  "kustomize": "kustomize.io",
  "prometheus": "prometheus.io",
  "grafana": "grafana.com",
  "cert-manager": "cert-manager.io",

  // Generic container & git platforms
  "docker": "docker.com",
  "buildx": "docker.com",
  "github": "github.com",
  "gitlab": "gitlab.com",
  "bitbucket": "atlassian.com",
};

export default function Step3Interrogate() {
  const { archetype, detectedStack, agentQuestions, userAnswers, setAnswer, setStep, setStatus } = useWizardStore();

  const handleSynthesize = () => {
    if (Object.keys(userAnswers).length < agentQuestions.length) {
      alert("Please answer all diagnostic questions before synthesizing."); 
      return;
    }
    setStep(4);
    setStatus("synthesizing");
  };

  const getToolDomain = (optionText: string) => {
    const lower = optionText.toLowerCase();
    for (const [key, domain] of Object.entries(TOOL_DOMAINS)) {
      if (lower.includes(key)) return domain;
    }
    return null;
  };

  const headerMeta = {
    pipeline: {
      title: "DevSecOps Pipeline Configuration",
      subtitle: "The agent analyzed the codebase. Select your security and delivery tooling.",
      icon: ShieldCheck,
    },
    terraform: {
      title: "Terraform Infrastructure Architecture",
      subtitle: "The agent evaluated the stack. Configure remote backends, network isolation, and tagging.",
      icon: Layers,
    },
    kubernetes: {
      title: "Kubernetes Cluster Architecture",
      subtitle: "The agent analyzed services and ports. Configure ingress, auto-scaling, and pod security.",
      icon: Server,
    },
    docker: {
      title: "Docker Compose Configuration",
      subtitle: "The agent analyzed your stack. Configure networking, volumes, and service dependencies.",
      icon: Box,
    },
  }[archetype];

  const HeaderIcon = headerMeta.icon;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="space-y-1 mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <HeaderIcon className="text-violet-400" size={20} />
          {headerMeta.title}
        </h2>
        <p className="text-xs text-white/50 leading-relaxed">
          {headerMeta.subtitle}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0 custom-scrollbar pb-6">
        {/* Detected Stack Display */}
        {detectedStack && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <h3 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Detected Repository Context</h3>
            <div className="flex flex-wrap gap-1.5">
              {detectedStack.languages?.map((l: string) => (
                <span key={l} className="px-2 py-0.5 rounded text-[11px] bg-violet-500/10 text-violet-300 border border-violet-500/20">{l}</span>
              ))}
              {detectedStack.packageManagers?.map((p: string) => (
                <span key={p} className="px-2 py-0.5 rounded text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/20">{p}</span>
              ))}
              {detectedStack.hasDockerfile && (
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Dockerfile</span>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Questions Rendered as Cards */}
        <div className="space-y-6">
          {agentQuestions.map((q) => (
            <div key={q.id} className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-white/90">{q.question}</span>
                <span className="block text-[11px] text-white/40 mt-0.5 italic">{q.rationale}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt) => {
                  const isSelected = userAnswers[q.id] === opt;
                  const domain = getToolDomain(opt);
                  
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      className={`relative p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                        isSelected 
                          ? "bg-violet-500/10 border-violet-500/40 text-violet-100 shadow-sm" 
                          : "bg-white/[0.02] border-white/[0.05] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.1]"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-violet-500 rounded-full flex items-center justify-center">
                          <Check size={8} className="text-white" />
                        </div>
                      )}
                      
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {domain ? (
                          <img 
                            src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`} 
                            alt=""
                            className="w-5 h-5 object-contain drop-shadow-md"
                          />
                        ) : (
                          <Box size={16} className="text-white/30" />
                        )}
                      </div>
                      
                      <span className="text-xs font-medium leading-tight">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 flex gap-3 flex-shrink-0 bg-[#0d0d0d]/80 backdrop-blur-md">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={handleSynthesize}
          disabled={Object.keys(userAnswers).length < agentQuestions.length}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        >
          Synthesize {archetype === "terraform" ? "Terraform" : archetype === "kubernetes" ? "Manifests" : archetype === "docker" ? "Compose File" : "Pipeline"} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
