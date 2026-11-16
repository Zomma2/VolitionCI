"use client";

import React, { useState } from "react";
import {
  Activity,
  Box,
  Cloud,
  Cpu,
  Database,
  GitBranch,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  Lock,
  Network,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const VERIFIED_ICON_URLS: Record<string, string> = {
  githubactions: "https://cdn.simpleicons.org/githubactions/E4E4E7",
  "github actions": "https://cdn.simpleicons.org/githubactions/E4E4E7",
  github: "https://cdn.simpleicons.org/github/E4E4E7",
  dependabot: "https://cdn.simpleicons.org/github/E4E4E7",
  gitlab: "https://cdn.simpleicons.org/gitlab/FC6D26",
  "gitlab ci": "https://cdn.simpleicons.org/gitlab/FC6D26",
  bitbucket: "https://cdn.simpleicons.org/bitbucket/60A5FA",
  "bitbucket pipelines": "https://cdn.simpleicons.org/bitbucket/60A5FA",
  circleci: "https://cdn.simpleicons.org/circleci/E4E4E7",
  jenkins: "https://cdn.simpleicons.org/jenkins/F87171",
  googlecloud: "https://cdn.simpleicons.org/googlecloud/60A5FA",
  "google cloud": "https://cdn.simpleicons.org/googlecloud/60A5FA",
  gcp: "https://cdn.simpleicons.org/googlecloud/60A5FA",
  azure: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
  microsoftazure: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
  digitalocean: "https://cdn.simpleicons.org/digitalocean/38BDF8",
  kubernetes: "https://cdn.simpleicons.org/kubernetes/60A5FA",
  "generic kubernetes": "https://cdn.simpleicons.org/kubernetes/60A5FA",
  k8s: "https://cdn.simpleicons.org/kubernetes/60A5FA",
  minikube: "https://cdn.simpleicons.org/kubernetes/93C5FD",
  "minikube / local": "https://cdn.simpleicons.org/kubernetes/93C5FD",
  docker: "https://cdn.simpleicons.org/docker/38BDF8",
  buildx: "https://cdn.simpleicons.org/docker/38BDF8",
  terraform: "https://cdn.simpleicons.org/terraform/C084FC",
  opentofu: "https://cdn.simpleicons.org/opentofu/FACC15",
  helm: "https://cdn.simpleicons.org/helm/E4E4E7",
  nginx: "https://cdn.simpleicons.org/nginx/34D399",
  "ingress-nginx": "https://cdn.simpleicons.org/nginx/34D399",
  traefik: "https://cdn.simpleicons.org/traefikproxy/38BDF8",
  traefikproxy: "https://cdn.simpleicons.org/traefikproxy/38BDF8",
  prometheus: "https://cdn.simpleicons.org/prometheus/FB923C",
  grafana: "https://cdn.simpleicons.org/grafana/FB923C",
  istio: "https://cdn.simpleicons.org/istio/60A5FA",
  argo: "https://cdn.simpleicons.org/argo/FB923C",
  argocd: "https://cdn.simpleicons.org/argo/FB923C",
  letsencrypt: "https://cdn.simpleicons.org/letsencrypt/38BDF8",
  "cert-manager": "https://cdn.simpleicons.org/letsencrypt/38BDF8",
  certmanager: "https://cdn.simpleicons.org/letsencrypt/38BDF8",
  cilium: "https://cdn.simpleicons.org/cilium/FACC15",
  nextdotjs: "https://cdn.simpleicons.org/nextdotjs/FFFFFF",
  "next.js": "https://cdn.simpleicons.org/nextdotjs/FFFFFF",
  nextjs: "https://cdn.simpleicons.org/nextdotjs/FFFFFF",
  react: "https://cdn.simpleicons.org/react/61DAFB",
  nodedotjs: "https://cdn.simpleicons.org/nodedotjs/4ADE80",
  "node.js": "https://cdn.simpleicons.org/nodedotjs/4ADE80",
  nodejs: "https://cdn.simpleicons.org/nodedotjs/4ADE80",
  python: "https://cdn.simpleicons.org/python/60A5FA",
  go: "https://cdn.simpleicons.org/go/38BDF8",
  golang: "https://cdn.simpleicons.org/go/38BDF8",
  rust: "https://cdn.simpleicons.org/rust/E4E4E7",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
  postgresql: "https://cdn.simpleicons.org/postgresql/60A5FA",
  postgres: "https://cdn.simpleicons.org/postgresql/60A5FA",
  mysql: "https://cdn.simpleicons.org/mysql/38BDF8",
  mongodb: "https://cdn.simpleicons.org/mongodb/4ADE80",
  redis: "https://cdn.simpleicons.org/redis/F87171",
  rabbitmq: "https://cdn.simpleicons.org/rabbitmq/FB923C",
  prisma: "https://cdn.simpleicons.org/prisma/E4E4E7",
  trivy: "https://cdn.simpleicons.org/trivy/38BDF8",
  aquasecurity: "https://cdn.simpleicons.org/trivy/38BDF8",
  sonar: "https://cdn.simpleicons.org/sonar/38BDF8",
  sonarqube: "https://cdn.simpleicons.org/sonar/38BDF8",
  sonarcloud: "https://cdn.simpleicons.org/sonar/38BDF8",
  snyk: "https://cdn.simpleicons.org/snyk/C084FC",
  elasticsearch: "https://cdn.simpleicons.org/elasticsearch/FBBF24",
  apachekafka: "https://cdn.simpleicons.org/apachekafka/E4E4E7",
  kafka: "https://cdn.simpleicons.org/apachekafka/E4E4E7",
  caddy: "https://cdn.simpleicons.org/caddy/34D399",
  datadog: "https://cdn.simpleicons.org/datadog/C084FC",
  sentry: "https://cdn.simpleicons.org/sentry/FB7185",
  vault: "https://cdn.simpleicons.org/vault/FACC15",
  cloudflare: "https://cdn.simpleicons.org/cloudflare/FB923C",
  opentelemetry: "https://cdn.simpleicons.org/opentelemetry/FBBF24",
  pulumi: "https://cdn.simpleicons.org/pulumi/FACC15",
  ansible: "https://cdn.simpleicons.org/ansible/F87171",
  packer: "https://cdn.simpleicons.org/packer/38BDF8",
  consul: "https://cdn.simpleicons.org/consul/FB7185",
  flux: "https://cdn.simpleicons.org/flux/60A5FA",
  harbor: "https://cdn.simpleicons.org/harbor/4ADE80",
  keycloak: "https://cdn.simpleicons.org/keycloak/38BDF8",
};

function ensureBrightHex(hex?: string): string {
  const cleaned = (hex || "E4E4E7").replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length !== 6) return "E4E4E7";
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (luminance < 0.28) {
    return "E4E4E7";
  }
  return cleaned.toUpperCase();
}

function renderMonochromeArchitecturalIcon(key: string, size: number): React.ReactNode | null {
  const iconSize = Math.max(12, size - 2);
  switch (key) {
    // Generation Targets
    case "target-pipeline":
      return <GitBranch size={iconSize} className="text-zinc-300 shrink-0" />;
    case "target-terraform":
      return <Layers size={iconSize} className="text-zinc-300 shrink-0" />;
    case "target-kubernetes":
      return <Server size={iconSize} className="text-zinc-300 shrink-0" />;
    case "target-docker":
      return <Box size={iconSize} className="text-zinc-300 shrink-0" />;

    // Cloud Providers & Networking
    case "aws":
    case "amazonwebservices":
      return <Cloud size={iconSize} className="text-zinc-300 shrink-0" />;
    case "aws-vpc":
    case "amazonvpc":
    case "azure-vnet":
    case "gcp-vpc":
    case "do-lb":
    case "linkerd":
      return <Network size={iconSize} className="text-zinc-300 shrink-0" />;

    // Compute & Clusters
    case "aws-eks":
    case "amazon eks":
    case "amazoneks":
    case "aws-ecs":
    case "amazonecs":
    case "azure-aks":
    case "azure aks":
    case "gcp-gke":
    case "google gke":
    case "do-doks":
    case "do-droplets":
      return <Server size={iconSize} className="text-zinc-300 shrink-0" />;

    // Serverless
    case "aws-lambda":
    case "awslambda":
    case "azure-functions":
    case "gcp-cloudrun":
      return <Cpu size={iconSize} className="text-zinc-300 shrink-0" />;

    // Databases & Caching
    case "aws-rds":
    case "amazonrds":
    case "aws-dynamodb":
    case "amazondynamodb":
    case "aws-elasticache":
    case "amazonelasticache":
    case "azure-sql":
    case "gcp-cloudsql":
    case "do-postgres":
      return <Database size={iconSize} className="text-zinc-300 shrink-0" />;

    // Object Storage & Registries
    case "aws-s3":
    case "amazons3":
    case "aws-ecr":
    case "amazonecr":
    case "azure-blob":
    case "gcp-gcs":
    case "do-spaces":
    case "do-registry":
    case "syft":
    case "kustomize":
      return <HardDrive size={iconSize} className="text-zinc-300 shrink-0" />;

    // Edge CDN
    case "aws-cloudfront":
    case "amazoncloudfront":
      return <Globe size={iconSize} className="text-zinc-300 shrink-0" />;

    // Identity, Secrets & KMS
    case "aws-iam":
    case "amazoniam":
      return <KeyRound size={iconSize} className="text-zinc-300 shrink-0" />;
    case "aws-secrets":
    case "awssecretsmanager":
    case "azure-keyvault":
    case "gcp-secrets":
      return <Lock size={iconSize} className="text-zinc-300 shrink-0" />;

    // Security Scanners
    case "semgrep":
    case "cosign":
    case "sigstore":
    case "checkov":
    case "gitleaks":
    case "trufflehog":
      return <ShieldCheck size={iconSize} className="text-zinc-300 shrink-0" />;

    // Runtime Profiles & Models
    case "local development":
    case "runtime-local":
      return <Terminal size={iconSize} className="text-zinc-300 shrink-0" />;
    case "production swarm":
    case "runtime-swarm":
      return <Server size={iconSize} className="text-zinc-300 shrink-0" />;
    case "testing / ci":
    case "runtime-ci":
      return <ShieldCheck size={iconSize} className="text-zinc-300 shrink-0" />;

    case "model-ensemble":
    case "model-gemini":
    case "model-mistral":
    case "model-openai":
    case "model-cohere":
    case "model-qwen":
      return <Cpu size={iconSize} className="text-zinc-400 shrink-0" />;

    default:
      return null;
  }
}

function renderSemanticFallback(label: string, size: number) {
  const lower = label.toLowerCase();
  const iconSize = Math.max(12, size - 2);
  if (lower.includes("oidc") || lower.includes("iam") || lower.includes("identity") || lower.includes("role")) {
    return <KeyRound size={iconSize} className="text-zinc-400 shrink-0" />;
  }
  if (lower.includes("kms") || lower.includes("tls") || lower.includes("mtls") || lower.includes("secret") || lower.includes("encrypt")) {
    return <Lock size={iconSize} className="text-zinc-400 shrink-0" />;
  }
  if (lower.includes("security") || lower.includes("sast") || lower.includes("scan") || lower.includes("non-root") || lower.includes("podsecurity") || lower.includes("policy")) {
    return <ShieldCheck size={iconSize} className="text-zinc-400 shrink-0" />;
  }
  if (lower.includes("state") || lower.includes("db") || lower.includes("sql") || lower.includes("volume") || lower.includes("storage") || lower.includes("pvc")) {
    return <Database size={iconSize} className="text-zinc-400 shrink-0" />;
  }
  if (lower.includes("vpc") || lower.includes("subnet") || lower.includes("network") || lower.includes("ingress") || lower.includes("gateway") || lower.includes("cidr")) {
    return <Network size={iconSize} className="text-zinc-400 shrink-0" />;
  }
  if (lower.includes("hpa") || lower.includes("autosc") || lower.includes("metric") || lower.includes("health") || lower.includes("probe")) {
    return <Activity size={iconSize} className="text-zinc-400 shrink-0" />;
  }
  if (lower.includes("cache") || lower.includes("layer") || lower.includes("module") || lower.includes("stage")) {
    return <Layers size={iconSize} className="text-zinc-400 shrink-0" />;
  }
  if (lower.includes("runner") || lower.includes("cluster") || lower.includes("node") || lower.includes("fargate")) {
    return <Cpu size={iconSize} className="text-zinc-400 shrink-0" />;
  }
  return <Box size={iconSize} className="text-zinc-400 shrink-0" />;
}

export function resolveIconKeyFromText(text: string): string | null {
  const lower = text.toLowerCase();
  const orderedMatches: [string, string][] = [
    ["github actions", "githubactions"],
    ["gitlab", "gitlab"],
    ["bitbucket", "bitbucket"],
    ["circleci", "circleci"],
    ["jenkins", "jenkins"],
    ["semgrep", "semgrep"],
    ["trivy", "trivy"],
    ["sonarqube", "sonarqube"],
    ["sonarcloud", "sonarqube"],
    ["cosign", "cosign"],
    ["sigstore", "cosign"],
    ["gitleaks", "gitleaks"],
    ["trufflehog", "trufflehog"],
    ["checkov", "checkov"],
    ["syft", "syft"],
    ["snyk", "snyk"],
    ["dependabot", "dependabot"],
    ["s3", "aws-s3"],
    ["dynamodb", "aws-dynamodb"],
    ["eks", "aws-eks"],
    ["ecs", "aws-ecs"],
    ["rds", "aws-rds"],
    ["lambda", "aws-lambda"],
    ["cloudfront", "aws-cloudfront"],
    ["aws", "aws"],
    ["aks", "azure-aks"],
    ["blob", "azure-blob"],
    ["azure", "azure"],
    ["gke", "gcp-gke"],
    ["gcs", "gcp-gcs"],
    ["cloud run", "gcp-cloudrun"],
    ["google cloud", "googlecloud"],
    ["gcp", "googlecloud"],
    ["digitalocean", "digitalocean"],
    ["opentofu", "opentofu"],
    ["terraform", "terraform"],
    ["ingress-nginx", "nginx"],
    ["nginx", "nginx"],
    ["traefik", "traefik"],
    ["istio", "istio"],
    ["linkerd", "linkerd"],
    ["cilium", "cilium"],
    ["cert-manager", "cert-manager"],
    ["argocd", "argocd"],
    ["argo", "argocd"],
    ["helm", "helm"],
    ["kustomize", "kustomize"],
    ["prometheus", "prometheus"],
    ["grafana", "grafana"],
    ["kubernetes", "kubernetes"],
    ["k8s", "kubernetes"],
    ["docker", "docker"],
    ["buildx", "docker"],
    ["postgres", "postgresql"],
    ["redis", "redis"],
    ["vault", "vault"],
  ];

  for (const [needle, iconKey] of orderedMatches) {
    if (lower.includes(needle)) return iconKey;
  }
  return null;
}

export interface TechIconProps {
  iconKey?: string;
  slug?: string;
  color?: string;
  name: string;
  size?: number;
  className?: string;
}

export default function TechIcon({
  iconKey,
  slug,
  color,
  name,
  size = 16,
  className = "",
}: TechIconProps) {
  const [failed, setFailed] = useState(false);

  const normalizedKey = (iconKey || "").trim().toLowerCase();
  const normalizedSlug = (slug || "").trim().toLowerCase();
  const normalizedName = name.trim().toLowerCase();

  const inlineMatch =
    renderMonochromeArchitecturalIcon(normalizedKey, size) ||
    renderMonochromeArchitecturalIcon(normalizedSlug, size) ||
    renderMonochromeArchitecturalIcon(normalizedName, size);

  if (inlineMatch) {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {inlineMatch}
      </span>
    );
  }

  const verifiedUrl =
    VERIFIED_ICON_URLS[normalizedKey] ||
    VERIFIED_ICON_URLS[normalizedSlug] ||
    VERIFIED_ICON_URLS[normalizedName];

  if (verifiedUrl && !failed) {
    return (
      <img
        src={verifiedUrl}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={`shrink-0 object-contain opacity-90 ${className}`}
      />
    );
  }

  const inferredKey = resolveIconKeyFromText(`${name} ${slug || ""}`);
  if (inferredKey) {
    const inferredInline = renderMonochromeArchitecturalIcon(inferredKey, size);
    if (inferredInline) {
      return (
        <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
          {inferredInline}
        </span>
      );
    }
    const inferredUrl = VERIFIED_ICON_URLS[inferredKey];
    if (inferredUrl && !failed) {
      return (
        <img
          src={inferredUrl}
          alt={name}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className={`shrink-0 object-contain opacity-90 ${className}`}
        />
      );
    }
  }

  if (normalizedSlug && !failed) {
    const brightHex = ensureBrightHex(color);
    return (
      <img
        src={`https://cdn.simpleicons.org/${normalizedSlug}/${brightHex}`}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={`shrink-0 object-contain opacity-90 ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      {renderSemanticFallback(name, size)}
    </span>
  );
}
