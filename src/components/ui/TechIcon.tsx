"use client";

import React, { useState } from "react";
import {
  Activity,
  Box,
  Cpu,
  Database,
  KeyRound,
  Layers,
  Lock,
  Network,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const VERIFIED_ICON_URLS: Record<string, string> = {
  githubactions: "https://cdn.simpleicons.org/githubactions/38BDF8",
  "github actions": "https://cdn.simpleicons.org/githubactions/38BDF8",
  github: "https://cdn.simpleicons.org/github/FFFFFF",
  dependabot: "https://cdn.simpleicons.org/github/FFFFFF",
  gitlab: "https://cdn.simpleicons.org/gitlab/FC6D26",
  "gitlab ci": "https://cdn.simpleicons.org/gitlab/FC6D26",
  bitbucket: "https://cdn.simpleicons.org/bitbucket/2684FF",
  "bitbucket pipelines": "https://cdn.simpleicons.org/bitbucket/2684FF",
  circleci: "https://cdn.simpleicons.org/circleci/F4F4F5",
  jenkins: "https://cdn.simpleicons.org/jenkins/F87171",
  googlecloud: "https://cdn.simpleicons.org/googlecloud/4285F4",
  "google cloud": "https://cdn.simpleicons.org/googlecloud/4285F4",
  gcp: "https://cdn.simpleicons.org/googlecloud/4285F4",
  azure: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
  microsoftazure: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
  digitalocean: "https://cdn.simpleicons.org/digitalocean/0080FF",
  kubernetes: "https://cdn.simpleicons.org/kubernetes/326CE5",
  "generic kubernetes": "https://cdn.simpleicons.org/kubernetes/326CE5",
  k8s: "https://cdn.simpleicons.org/kubernetes/326CE5",
  minikube: "https://cdn.simpleicons.org/kubernetes/60A5FA",
  "minikube / local": "https://cdn.simpleicons.org/kubernetes/60A5FA",
  docker: "https://cdn.simpleicons.org/docker/2496ED",
  buildx: "https://cdn.simpleicons.org/docker/2496ED",
  terraform: "https://cdn.simpleicons.org/terraform/A855F7",
  opentofu: "https://cdn.simpleicons.org/opentofu/FFDA18",
  helm: "https://cdn.simpleicons.org/helm/38BDF8",
  nginx: "https://cdn.simpleicons.org/nginx/22C55E",
  "ingress-nginx": "https://cdn.simpleicons.org/nginx/22C55E",
  traefik: "https://cdn.simpleicons.org/traefikproxy/24A1C1",
  traefikproxy: "https://cdn.simpleicons.org/traefikproxy/24A1C1",
  prometheus: "https://cdn.simpleicons.org/prometheus/F97316",
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
  go: "https://cdn.simpleicons.org/go/22D3EE",
  golang: "https://cdn.simpleicons.org/go/22D3EE",
  rust: "https://cdn.simpleicons.org/rust/F4F4F5",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
  postgresql: "https://cdn.simpleicons.org/postgresql/60A5FA",
  postgres: "https://cdn.simpleicons.org/postgresql/60A5FA",
  mysql: "https://cdn.simpleicons.org/mysql/38BDF8",
  mongodb: "https://cdn.simpleicons.org/mongodb/4ADE80",
  redis: "https://cdn.simpleicons.org/redis/F87171",
  rabbitmq: "https://cdn.simpleicons.org/rabbitmq/FB923C",
  prisma: "https://cdn.simpleicons.org/prisma/FFFFFF",
  trivy: "https://cdn.simpleicons.org/trivy/38BDF8",
  aquasecurity: "https://cdn.simpleicons.org/trivy/38BDF8",
  sonar: "https://cdn.simpleicons.org/sonar/38BDF8",
  sonarqube: "https://cdn.simpleicons.org/sonar/38BDF8",
  sonarcloud: "https://cdn.simpleicons.org/sonar/38BDF8",
  snyk: "https://cdn.simpleicons.org/snyk/C084FC",
  elasticsearch: "https://cdn.simpleicons.org/elasticsearch/FBBF24",
  apachekafka: "https://cdn.simpleicons.org/apachekafka/FFFFFF",
  kafka: "https://cdn.simpleicons.org/apachekafka/FFFFFF",
  caddy: "https://cdn.simpleicons.org/caddy/22C55E",
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
  const cleaned = (hex || "38BDF8").replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length !== 6) return "38BDF8";
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (luminance < 0.28) {
    return "E4E4E7";
  }
  return cleaned.toUpperCase();
}

function renderInlineVector(key: string, size: number): React.ReactNode | null {
  switch (key) {
    // Generation Target Emblems
    case "target-pipeline":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="5" cy="6" r="2.5" stroke="#22D3EE" strokeWidth="1.8" />
          <circle cx="5" cy="18" r="2.5" stroke="#22D3EE" strokeWidth="1.8" />
          <circle cx="19" cy="12" r="2.8" fill="#22D3EE" fillOpacity="0.2" stroke="#22D3EE" strokeWidth="1.8" />
          <path d="M7.5 6H11C13 6 13.5 12 16 12M7.5 18H11C13 18 13.5 12 16 12" stroke="#22D3EE" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "target-terraform":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M9 3.5L15 7V14L9 10.5V3.5Z" fill="#FBBF24" />
          <path d="M16 7.6L21.5 4.5V11.5L16 14.6V7.6Z" fill="#F59E0B" fillOpacity="0.85" />
          <path d="M2.5 4L8 7.2V14.2L2.5 11V4Z" fill="#FDE68A" fillOpacity="0.9" />
          <path d="M9 12L15 15.5V22L9 18.5V12Z" fill="#F59E0B" />
        </svg>
      );
    case "target-kubernetes":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2.2 19.6,6.2 21.5,14.5 16.2,21.2 7.8,21.2 2.5,14.5 4.4,6.2"
            fill="#3B82F6"
            fillOpacity="0.18"
            stroke="#60A5FA"
            strokeWidth="1.7"
          />
          <circle cx="12" cy="12" r="3.2" stroke="#93C5FD" strokeWidth="1.6" />
          <path d="M12 4.8V8.8M12 15.2V19.2M5.5 8.5L8.9 10.4M15.1 13.6L18.5 15.5M18.5 8.5L15.1 10.4M8.9 13.6L5.5 15.5" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "target-docker":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="10" width="4" height="3.5" rx="0.7" fill="#34D399" />
          <rect x="8" y="10" width="4" height="3.5" rx="0.7" fill="#34D399" />
          <rect x="13" y="10" width="4" height="3.5" rx="0.7" fill="#34D399" />
          <rect x="8" y="5.5" width="4" height="3.5" rx="0.7" fill="#6EE7B7" />
          <rect x="13" y="5.5" width="4" height="3.5" rx="0.7" fill="#10B981" />
          <path d="M2 15C2 18.2 5.2 20 10.5 20C16.5 20 20.2 17.2 21.5 13.2C20.2 12.8 18.8 13 18 13.8C17.5 12.5 16.3 12 15 12" stroke="#34D399" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    // AWS Platform & 12 Distinct AWS Services
    case "aws":
    case "amazonwebservices":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L19.5 7.3V14.2L12 18.5L4.5 14.2V7.3L12 3Z" fill="#FF9900" fillOpacity="0.16" stroke="#FF9900" strokeWidth="1.7" />
          <path d="M12 3V10.8M12 10.8L19.2 7.2M12 10.8L4.8 7.2" stroke="#FDBA74" strokeWidth="1.4" />
          <path d="M5.5 19.6C9.2 21.8 14.8 21.8 18.5 19.6" stroke="#FF9900" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M17.2 18.6L19 19.5L18.1 21.3" stroke="#FF9900" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "aws-vpc":
    case "amazonvpc":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="3" fill="#A855F7" fillOpacity="0.15" stroke="#C084FC" strokeWidth="1.7" />
          <circle cx="8" cy="9.5" r="1.8" fill="#E9D5FF" />
          <circle cx="16" cy="9.5" r="1.8" fill="#E9D5FF" />
          <circle cx="12" cy="15.5" r="1.8" fill="#C084FC" />
          <path d="M9.6 10.3L11.2 14M14.4 10.3L12.8 14M9.8 9.5H14.2" stroke="#C084FC" strokeWidth="1.5" />
        </svg>
      );
    case "aws-eks":
    case "amazon eks":
    case "amazoneks":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="12,2.5 20,7 20,17 12,21.5 4,17 4,7" fill="#FF9900" fillOpacity="0.16" stroke="#FF9900" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="3.2" stroke="#FDBA74" strokeWidth="1.6" />
          <path d="M12 5.5V8.8M12 15.2V18.5M6.4 8.8L9.2 10.4M14.8 13.6L17.6 15.2M17.6 8.8L14.8 10.4M9.2 13.6L6.4 15.2" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "aws-ecs":
    case "amazonecs":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="8" height="7" rx="1.5" fill="#FB923C" fillOpacity="0.22" stroke="#FB923C" strokeWidth="1.6" />
          <rect x="13" y="4" width="8" height="7" rx="1.5" fill="#FB923C" fillOpacity="0.22" stroke="#FB923C" strokeWidth="1.6" />
          <rect x="8" y="13" width="8" height="7" rx="1.5" fill="#FF9900" fillOpacity="0.3" stroke="#FDBA74" strokeWidth="1.6" />
        </svg>
      );
    case "aws-rds":
    case "amazonrds":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="6" rx="7" ry="2.8" fill="#3B82F6" fillOpacity="0.25" stroke="#60A5FA" strokeWidth="1.7" />
          <path d="M5 6V17.5C5 19.1 8.1 20.4 12 20.4C15.9 20.4 19 19.1 19 17.5V6" stroke="#60A5FA" strokeWidth="1.7" />
          <path d="M5 11.8C5 13.4 8.1 14.7 12 14.7C15.9 14.7 19 13.4 19 11.8" stroke="#93C5FD" strokeWidth="1.5" />
        </svg>
      );
    case "aws-s3":
    case "amazons3":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="6.5" rx="6.8" ry="2.5" fill="#22C55E" fillOpacity="0.22" stroke="#4ADE80" strokeWidth="1.7" />
          <path d="M5.4 6.8L7.2 18.5C7.4 19.8 9.5 20.8 12 20.8C14.5 20.8 16.6 19.8 16.8 18.5L18.6 6.8" stroke="#4ADE80" strokeWidth="1.7" />
          <circle cx="12" cy="13.5" r="2" fill="#86EFAC" />
        </svg>
      );
    case "aws-dynamodb":
    case "amazondynamodb":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="4" width="17" height="16" rx="2.5" fill="#2563EB" fillOpacity="0.18" stroke="#60A5FA" strokeWidth="1.7" />
          <path d="M13 6.5L8.8 12.5H12.4L11 17.5L15.4 11.5H11.8L13 6.5Z" fill="#38BDF8" stroke="#BAE6FD" strokeWidth="0.9" strokeLinejoin="round" />
        </svg>
      );
    case "aws-lambda":
    case "awslambda":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="#FF9900" fillOpacity="0.18" stroke="#FB923C" strokeWidth="1.7" />
          <path d="M8.5 7H11L15.8 17H13.3L11.5 13L9.4 17H7L10.3 10.6L8.5 7Z" fill="#FDBA74" />
        </svg>
      );
    case "aws-iam":
    case "amazoniam":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L19 6V11.8C19 16.2 16 19.8 12 21C8 19.8 5 16.2 5 11.8V6L12 3Z" fill="#EF4444" fillOpacity="0.16" stroke="#F87171" strokeWidth="1.7" />
          <circle cx="12" cy="10.5" r="2" stroke="#FCA5A5" strokeWidth="1.6" />
          <path d="M12 12.5V16.5M12 15H14" stroke="#FCA5A5" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "aws-ecr":
    case "amazonecr":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3.5L20 7.5L12 11.5L4 7.5L12 3.5Z" fill="#F59E0B" fillOpacity="0.25" stroke="#FBBF24" strokeWidth="1.6" />
          <path d="M4 12L12 16L20 12" stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 16.5L12 20.5L20 16.5" stroke="#FDE68A" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "aws-cloudfront":
    case "amazoncloudfront":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" fill="#9333EA" fillOpacity="0.16" stroke="#C084FC" strokeWidth="1.7" />
          <ellipse cx="12" cy="12" rx="4" ry="8.5" stroke="#D8B4FE" strokeWidth="1.4" />
          <path d="M4 12H20" stroke="#C084FC" strokeWidth="1.4" />
        </svg>
      );
    case "aws-elasticache":
    case "amazonelasticache":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="12,3 21,12 12,21 3,12" fill="#D946EF" fillOpacity="0.16" stroke="#E879F9" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="3" fill="#F0ABFC" />
        </svg>
      );
    case "aws-secrets":
    case "awssecretsmanager":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="10.5" width="14" height="10" rx="2" fill="#E11D48" fillOpacity="0.18" stroke="#FB7185" strokeWidth="1.7" />
          <path d="M8.5 10.5V7.5C8.5 5.6 10.1 4 12 4C13.9 4 15.5 5.6 15.5 7.5V10.5" stroke="#FDA4AF" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="12" cy="15.5" r="1.5" fill="#FFE4E6" />
        </svg>
      );

    // Azure Sub-Services
    case "azure-vnet":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="3" fill="#0284C7" fillOpacity="0.18" stroke="#38BDF8" strokeWidth="1.7" />
          <path d="M7.5 8.5L4.8 12L7.5 15.5M16.5 8.5L19.2 12L16.5 15.5" stroke="#7DD3FC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2" fill="#38BDF8" />
        </svg>
      );
    case "azure-aks":
    case "azure aks":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="12,2.5 20,7 20,17 12,21.5 4,17 4,7" fill="#0284C7" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="1.7" />
          <rect x="8.8" y="8.8" width="6.4" height="6.4" rx="1.2" stroke="#BAE6FD" strokeWidth="1.6" />
        </svg>
      );
    case "azure-sql":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="6" rx="6.8" ry="2.6" fill="#0EA5E9" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1.7" />
          <path d="M5.2 6V17.5C5.2 19 8.2 20.2 12 20.2C15.8 20.2 18.8 19 18.8 17.5V6" stroke="#38BDF8" strokeWidth="1.7" />
          <path d="M9 13.5H15" stroke="#BAE6FD" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "azure-blob":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="#06B6D4" fillOpacity="0.18" stroke="#22D3EE" strokeWidth="1.7" />
          <rect x="7" y="8" width="4.2" height="3.5" rx="0.8" fill="#67E8F9" />
          <rect x="12.8" y="8" width="4.2" height="3.5" rx="0.8" fill="#22D3EE" />
          <rect x="7" y="13" width="10" height="3" rx="0.8" fill="#A5F3FC" fillOpacity="0.8" />
        </svg>
      );
    case "azure-keyvault":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" fill="#F59E0B" fillOpacity="0.16" stroke="#FBBF24" strokeWidth="1.7" />
          <circle cx="10.5" cy="11" r="2.2" stroke="#FDE68A" strokeWidth="1.6" />
          <path d="M12.3 12.6L16 16.3M14.5 14.8L16 13.5" stroke="#FBBF24" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "azure-functions":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M7 5L3.5 12L7 19M17 5L20.5 12L17 19" stroke="#60A5FA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 4.5L9 12.5H12.5L11 19.5L15.5 11.5H12L13 4.5Z" fill="#FACC15" />
        </svg>
      );

    // GCP Sub-Services
    case "gcp-vpc":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="7" r="2.5" fill="#4285F4" />
          <circle cx="18" cy="7" r="2.5" fill="#34A853" />
          <circle cx="12" cy="17.5" r="2.8" fill="#FBBC05" />
          <path d="M8.2 8.2L10.8 15.2M15.8 8.2L13.2 15.2M8.5 7H15.5" stroke="#93C5FD" strokeWidth="1.6" />
        </svg>
      );
    case "gcp-cloudrun":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="#3B82F6" fillOpacity="0.16" stroke="#60A5FA" strokeWidth="1.7" />
          <path d="M9.5 8L16.5 12L9.5 16V8Z" fill="#38BDF8" />
        </svg>
      );
    case "gcp-gke":
    case "google gke":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="12,2.5 20,7 20,17 12,21.5 4,17 4,7" fill="#4285F4" fillOpacity="0.2" stroke="#60A5FA" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="3.5" fill="#93C5FD" fillOpacity="0.3" stroke="#93C5FD" strokeWidth="1.6" />
        </svg>
      );
    case "gcp-cloudsql":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="6" rx="6.8" ry="2.6" fill="#4285F4" fillOpacity="0.25" stroke="#60A5FA" strokeWidth="1.7" />
          <path d="M5.2 6V17.5C5.2 19 8.2 20.2 12 20.2C15.8 20.2 18.8 19 18.8 17.5V6" stroke="#60A5FA" strokeWidth="1.7" />
          <circle cx="12" cy="13.5" r="1.8" fill="#FBBF24" />
        </svg>
      );
    case "gcp-gcs":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M4.5 7.5H19.5L17.8 19H6.2L4.5 7.5Z" fill="#10B981" fillOpacity="0.2" stroke="#34D399" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M8 5H16" stroke="#6EE7B7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "gcp-secrets":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3L19 6.2V12C19 16.3 15.9 19.7 12 21C8.1 19.7 5 16.3 5 12V6.2L12 3Z" fill="#F59E0B" fillOpacity="0.18" stroke="#FBBF24" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="2.2" fill="#FDE68A" />
        </svg>
      );

    // DigitalOcean Sub-Services
    case "do-droplets":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3.5C12 3.5 6 10.2 6 14.5C6 17.8 8.7 20.5 12 20.5C15.3 20.5 18 17.8 18 14.5C18 10.2 12 3.5 12 3.5Z" fill="#0080FF" fillOpacity="0.24" stroke="#38BDF8" strokeWidth="1.7" />
        </svg>
      );
    case "do-doks":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="12,2.5 20,7 20,17 12,21.5 4,17 4,7" fill="#0080FF" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="2.6" fill="#7DD3FC" />
        </svg>
      );
    case "do-postgres":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="6" rx="6.8" ry="2.5" fill="#0284C7" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1.7" />
          <path d="M5.2 6V17.5C5.2 19 8.2 20.2 12 20.2C15.8 20.2 18.8 19 18.8 17.5V6" stroke="#38BDF8" strokeWidth="1.7" />
        </svg>
      );
    case "do-spaces":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3.5L19.5 7.8V16.2L12 20.5L4.5 16.2V7.8L12 3.5Z" fill="#06B6D4" fillOpacity="0.2" stroke="#22D3EE" strokeWidth="1.7" />
          <path d="M4.8 8L12 12L19.2 8M12 12V20.2" stroke="#67E8F9" strokeWidth="1.5" />
        </svg>
      );
    case "do-lb":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="5.5" cy="12" r="2.3" fill="#34D399" />
          <circle cx="18.5" cy="6.5" r="2.1" stroke="#6EE7B7" strokeWidth="1.6" />
          <circle cx="18.5" cy="17.5" r="2.1" stroke="#6EE7B7" strokeWidth="1.6" />
          <path d="M7.8 11.2L16.3 7.2M7.8 12.8L16.3 16.8" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "do-registry":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="7" height="7" rx="1.4" fill="#8B5CF6" fillOpacity="0.25" stroke="#A78BFA" strokeWidth="1.6" />
          <rect x="13" y="4" width="7" height="7" rx="1.4" fill="#8B5CF6" fillOpacity="0.25" stroke="#A78BFA" strokeWidth="1.6" />
          <rect x="4" y="13" width="7" height="7" rx="1.4" fill="#8B5CF6" fillOpacity="0.25" stroke="#A78BFA" strokeWidth="1.6" />
          <rect x="13" y="13" width="7" height="7" rx="1.4" fill="#C4B5FD" fillOpacity="0.35" stroke="#DDD6FE" strokeWidth="1.6" />
        </svg>
      );

    // Security & DevSecOps Tools (Guaranteed 0-404 Vectors)
    case "semgrep":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="3" fill="#10B981" fillOpacity="0.16" stroke="#34D399" strokeWidth="1.7" />
          <circle cx="9" cy="12" r="2.2" fill="#6EE7B7" />
          <circle cx="15" cy="12" r="2.2" stroke="#34D399" strokeWidth="1.7" />
          <path d="M6.5 8.5H17.5M6.5 15.5H13" stroke="#34D399" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "cosign":
    case "sigstore":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 2.8L19 6V11.8C19 16.2 15.9 19.7 12 21C8.1 19.7 5 16.2 5 11.8V6L12 2.8Z" fill="#8B5CF6" fillOpacity="0.18" stroke="#A78BFA" strokeWidth="1.7" />
          <path d="M8.8 12.2L11 14.4L15.4 9.8" stroke="#DDD6FE" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "checkov":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="#22C55E" fillOpacity="0.16" stroke="#4ADE80" strokeWidth="1.7" />
          <path d="M8 12.3L10.8 15L16.2 9.2" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "gitleaks":
    case "trufflehog":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="6.5" fill="#F43F5E" fillOpacity="0.16" stroke="#FB7185" strokeWidth="1.7" />
          <path d="M15.8 15.8L20 20" stroke="#FB7185" strokeWidth="2" strokeLinecap="round" />
          <circle cx="11" cy="11" r="2" fill="#FDA4AF" />
        </svg>
      );
    case "syft":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3.5L19.5 7.6V16.4L12 20.5L4.5 16.4V7.6L12 3.5Z" fill="#06B6D4" fillOpacity="0.16" stroke="#22D3EE" strokeWidth="1.7" />
          <path d="M8.5 10.5H15.5M8.5 14H13.5" stroke="#A5F3FC" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "kustomize":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3.5L20 8L12 12.5L4 8L12 3.5Z" fill="#3B82F6" fillOpacity="0.28" stroke="#60A5FA" strokeWidth="1.6" />
          <path d="M4 12.2L12 16.7L20 12.2" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 16.2L12 20.7L20 16.2" stroke="#60A5FA" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "linkerd":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M6 7L12 3.5L18 7V17L12 20.5L6 17V7Z" fill="#14B8A6" fillOpacity="0.18" stroke="#2DD4BF" strokeWidth="1.7" />
          <path d="M6 12H18M12 3.5V20.5" stroke="#5EEAD4" strokeWidth="1.4" />
        </svg>
      );

    // Docker Runtime Profiles
    case "local development":
    case "runtime-local":
      return <Terminal size={size - 2} className="text-emerald-400 shrink-0" />;
    case "production swarm":
    case "runtime-swarm":
      return <Server size={size - 2} className="text-emerald-400 shrink-0" />;
    case "testing / ci":
    case "runtime-ci":
      return <ShieldCheck size={size - 2} className="text-teal-300 shrink-0" />;

    // AI Engine & Model Emblems
    case "model-ensemble":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="7" cy="7" r="2.6" fill="#22D3EE" />
          <circle cx="17" cy="7" r="2.6" fill="#FBBF24" />
          <circle cx="7" cy="17" r="2.6" fill="#34D399" />
          <circle cx="17" cy="17" r="2.6" fill="#60A5FA" />
          <path d="M9.5 7H14.5M7 9.5V14.5M17 9.5V14.5M9.5 17H14.5M9 9L15 15M15 9L9 15" stroke="#E4E4E7" strokeOpacity="0.65" strokeWidth="1.3" />
        </svg>
      );
    case "model-gemini":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 2.5C12.6 7.8 16.2 11.4 21.5 12C16.2 12.6 12.6 16.2 12 21.5C11.4 16.2 7.8 12.6 2.5 12C7.8 11.4 11.4 7.8 12 2.5Z" fill="#38BDF8" fillOpacity="0.28" stroke="#60A5FA" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "model-mistral":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="4" height="4" fill="#FBBF24" />
          <rect x="17" y="4" width="4" height="4" fill="#FBBF24" />
          <rect x="3" y="9" width="8" height="4" fill="#FB923C" />
          <rect x="13" y="9" width="8" height="4" fill="#FB923C" />
          <rect x="3" y="14" width="4" height="6" fill="#F97316" />
          <rect x="10" y="14" width="4" height="4" fill="#FDBA74" />
          <rect x="17" y="14" width="4" height="6" fill="#F97316" />
        </svg>
      );
    case "model-openai":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="12,3 19.8,7.5 19.8,16.5 12,21 4.2,16.5 4.2,7.5" fill="#10B981" fillOpacity="0.18" stroke="#34D399" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="3" stroke="#A7F3D0" strokeWidth="1.6" />
        </svg>
      );
    case "model-cohere":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="9.5" cy="12" r="6" fill="#FB7185" fillOpacity="0.22" stroke="#FB7185" strokeWidth="1.7" />
          <circle cx="16.5" cy="9" r="3.2" fill="#FDA4AF" fillOpacity="0.35" stroke="#FDA4AF" strokeWidth="1.5" />
          <circle cx="16.5" cy="16" r="2.2" fill="#34D399" />
        </svg>
      );
    case "model-qwen":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="#6366F1" fillOpacity="0.2" stroke="#818CF8" strokeWidth="1.7" />
          <path d="M13.2 6.5L8.8 12.5H12.3L10.8 17.5L15.4 11.5H11.9L13.2 6.5Z" fill="#C7D2FE" />
        </svg>
      );
    default:
      return null;
  }
}

function renderSemanticFallback(label: string, size: number) {
  const lower = label.toLowerCase();
  const iconSize = Math.max(12, size - 3);
  if (lower.includes("oidc") || lower.includes("iam") || lower.includes("identity") || lower.includes("role")) {
    return <KeyRound size={iconSize} className="text-amber-300 shrink-0" />;
  }
  if (lower.includes("kms") || lower.includes("tls") || lower.includes("mtls") || lower.includes("secret") || lower.includes("encrypt")) {
    return <Lock size={iconSize} className="text-cyan-300 shrink-0" />;
  }
  if (lower.includes("security") || lower.includes("sast") || lower.includes("scan") || lower.includes("non-root") || lower.includes("podsecurity") || lower.includes("policy")) {
    return <ShieldCheck size={iconSize} className="text-emerald-400 shrink-0" />;
  }
  if (lower.includes("state") || lower.includes("db") || lower.includes("sql") || lower.includes("volume") || lower.includes("storage") || lower.includes("pvc")) {
    return <Database size={iconSize} className="text-blue-400 shrink-0" />;
  }
  if (lower.includes("vpc") || lower.includes("subnet") || lower.includes("network") || lower.includes("ingress") || lower.includes("gateway") || lower.includes("cidr")) {
    return <Network size={iconSize} className="text-purple-300 shrink-0" />;
  }
  if (lower.includes("hpa") || lower.includes("autosc") || lower.includes("metric") || lower.includes("health") || lower.includes("probe")) {
    return <Activity size={iconSize} className="text-emerald-300 shrink-0" />;
  }
  if (lower.includes("cache") || lower.includes("layer") || lower.includes("module") || lower.includes("stage")) {
    return <Layers size={iconSize} className="text-cyan-300 shrink-0" />;
  }
  if (lower.includes("runner") || lower.includes("cluster") || lower.includes("node") || lower.includes("fargate")) {
    return <Cpu size={iconSize} className="text-zinc-300 shrink-0" />;
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
  size = 18,
  className = "",
}: TechIconProps) {
  const [failed, setFailed] = useState(false);

  const normalizedKey = (iconKey || "").trim().toLowerCase();
  const normalizedSlug = (slug || "").trim().toLowerCase();
  const normalizedName = name.trim().toLowerCase();

  // 1. Check inline high-contrast SVG vectors first (instant 0ms, zero network failure)
  const inlineMatch =
    renderInlineVector(normalizedKey, size) ||
    renderInlineVector(normalizedSlug, size) ||
    renderInlineVector(normalizedName, size);

  if (inlineMatch) {
    return <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>{inlineMatch}</span>;
  }

  // 2. Check HTTP-verified SimpleIcons / Devicon brand URLs
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
        className={`shrink-0 object-contain ${className}`}
      />
    );
  }

  // 3. Check text keyword match (e.g., AI recommendation "Aqua Trivy" -> "trivy")
  const inferredKey = resolveIconKeyFromText(`${name} ${slug || ""}`);
  if (inferredKey) {
    const inferredInline = renderInlineVector(inferredKey, size);
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
          className={`shrink-0 object-contain ${className}`}
        />
      );
    }
  }

  // 4. Dynamic SimpleIcons slug with automatic dark-mode brightness normalization + onError fallback
  if (normalizedSlug && !failed) {
    const brightHex = ensureBrightHex(color);
    return (
      <img
        src={`https://cdn.simpleicons.org/${normalizedSlug}/${brightHex}`}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={`shrink-0 object-contain ${className}`}
      />
    );
  }

  // 5. Guaranteed semantic vector fallback — never renders a broken image icon
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      {renderSemanticFallback(name, size)}
    </span>
  );
}
