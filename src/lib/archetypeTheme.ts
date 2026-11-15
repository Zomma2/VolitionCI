import { Archetype } from "@/store/useWizardStore";

export interface ArchetypeStarterPrompt {
  label: string;
  platform: string;
  prompt: string;
}

export interface ArchetypeSampleRepo {
  label: string;
  url: string;
  note: string;
}

export interface ArchetypeThemeConfig {
  id: Archetype;
  name: string;
  shortLabel: string;
  subtitle: string;
  artifact: string;
  validationBadge: string;
  architectTitle: string;
  architectHeadline: string;
  architectBrief: string;
  loadingStatusText: string;
  chatPlaceholder: string;
  scanInspectorNote: string;
  accentHex: string;
  classes: {
    topAccentBar: string;
    cardActive: string;
    iconActive: string;
    badge: string;
    stepActive: string;
    platformActive: string;
    techCardActive: string;
    userBubble: string;
    draftPanelBorder: string;
    draftTitle: string;
    chipActive: string;
    checkboxActive: string;
    primaryBtn: string;
    outlineBtn: string;
    inputFocus: string;
    starterHover: string;
    starterTitleHover: string;
    dot: string;
    spinner: string;
  };
  starterPrompts: ArchetypeStarterPrompt[];
  sampleRepos: ArchetypeSampleRepo[];
}

export const ARCHETYPE_THEMES: Record<Archetype, ArchetypeThemeConfig> = {
  pipeline: {
    id: "pipeline",
    name: "CI/CD Pipeline",
    shortLabel: "CI/CD",
    subtitle: "Zero-trust build, SAST & progressive rollout",
    artifact: ".github/workflows/*.yml",
    validationBadge: "YAML Workflow Schema & DevSecOps Gate",
    architectTitle: "CI/CD DevSecOps Pipeline Architect",
    architectHeadline: "Design a zero-trust build, security scanning, and deployment pipeline",
    architectBrief:
      "Evaluates OIDC cloud federation, dependency caching, SAST/container CVE scanning, SBOM attestation, and progressive environment promotion.",
    loadingStatusText:
      "Evaluating OIDC federation, build matrix caching, and SAST/CVE security gates...",
    chatPlaceholder:
      "e.g., Build a GitHub Actions pipeline for Next.js + Prisma deploying to AWS ECS via OIDC with Semgrep and Trivy...",
    scanInspectorNote:
      "Inspects package manifests, lockfiles, test runners, and Dockerfiles via the GitHub REST API to synthesize deterministic build, cache, SAST, and rollout jobs.",
    accentHex: "#22d3ee",
    classes: {
      topAccentBar: "from-cyan-500/80 via-cyan-400 to-cyan-300/60",
      cardActive:
        "bg-cyan-400/[0.09] border-cyan-400/50 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.15)]",
      iconActive: "text-cyan-400",
      badge: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
      stepActive: "bg-cyan-400/12 text-cyan-300 border border-cyan-400/35",
      platformActive: "bg-cyan-400/15 border-cyan-400/50 text-cyan-200",
      techCardActive: "bg-cyan-400/10 border-cyan-400/45 text-white",
      userBubble: "bg-cyan-400/10 text-zinc-100 border border-cyan-400/30",
      draftPanelBorder: "border-cyan-400/30",
      draftTitle: "text-cyan-300",
      chipActive:
        "bg-cyan-400/10 text-cyan-200 border-cyan-400/30 hover:bg-cyan-400/15",
      checkboxActive: "bg-cyan-400 border-cyan-400",
      primaryBtn: "bg-cyan-400 hover:bg-cyan-300 text-zinc-950",
      outlineBtn:
        "text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/15 border-cyan-400/30",
      inputFocus: "focus:border-cyan-400/60",
      starterHover: "hover:border-cyan-400/40",
      starterTitleHover: "group-hover:text-cyan-300",
      dot: "bg-cyan-400",
      spinner: "text-cyan-400",
    },
    starterPrompts: [
      {
        label: "Next.js + Prisma -> AWS ECS (OIDC)",
        platform: "GitHub Actions",
        prompt:
          "Build a GitHub Actions pipeline for a Next.js and Prisma PostgreSQL app deploying to AWS ECS with OIDC role assumption, Semgrep SAST, and Trivy ECR scanning.",
      },
      {
        label: "Go Microservice -> GitLab CI + Cosign",
        platform: "GitLab CI",
        prompt:
          "Create a GitLab CI pipeline for a Go microservice with multi-arch Docker Buildx builds, Gitleaks secret scanning, Cosign keyless image signing, and Helm rollout.",
      },
      {
        label: "Python FastAPI -> GCP Cloud Run",
        platform: "GitHub Actions",
        prompt:
          "Synthesize a GitHub Actions workflow for a Python FastAPI service with uv caching, pytest coverage gates, SonarQube analysis, and Workload Identity deploy to Cloud Run.",
      },
      {
        label: "Java Spring Boot -> Enterprise Jenkins",
        platform: "Jenkins",
        prompt:
          "Generate a declarative Jenkins pipeline for a Java 21 Spring Boot API using Gradle build caching, Snyk dependency audit, Harbor registry push, and staging approval gates.",
      },
    ],
    sampleRepos: [
      {
        label: "Zomma2/VolitionCI",
        url: "https://github.com/Zomma2/VolitionCI",
        note: "Next.js 16 + TypeScript",
      },
      {
        label: "vercel/next.js",
        url: "https://github.com/vercel/next.js",
        note: "Turborepo Monorepo",
      },
      {
        label: "fastapi/full-stack-fastapi-template",
        url: "https://github.com/fastapi/full-stack-fastapi-template",
        note: "Python + Docker",
      },
      {
        label: "golang-standards/project-layout",
        url: "https://github.com/golang-standards/project-layout",
        note: "Go Service Layout",
      },
    ],
  },

  terraform: {
    id: "terraform",
    name: "Terraform HCL",
    shortLabel: "Terraform",
    subtitle: "Modular cloud topology, KMS & state locking",
    artifact: "infra/main.tf",
    validationBadge: "HCL2 Block, Resource Graph & State Verifier",
    architectTitle: "Cloud Infrastructure & Terraform State Architect",
    architectHeadline: "Provision modular, least-privilege cloud infrastructure with remote state",
    architectBrief:
      "Evaluates remote state locking backends, multi-AZ VPC CIDR boundaries, private subnet NAT routing, KMS encryption keys, and scoped IAM roles.",
    loadingStatusText:
      "Evaluating remote state locking, multi-AZ CIDR topology, and KMS/IAM boundaries...",
    chatPlaceholder:
      "e.g., Provision an AWS 3-AZ VPC with S3 state locking, private subnets, EKS 1.31, and Multi-AZ RDS PostgreSQL 16...",
    scanInspectorNote:
      "Inspects existing .tf modules, Dockerfiles, and application data stores in your repository to synthesize matching cloud VPC, compute, IAM, and database HCL.",
    accentHex: "#fbbf24",
    classes: {
      topAccentBar: "from-amber-500/80 via-amber-400 to-amber-300/60",
      cardActive:
        "bg-amber-400/[0.09] border-amber-400/50 text-white shadow-[0_0_0_1px_rgba(251,191,36,0.15)]",
      iconActive: "text-amber-400",
      badge: "bg-amber-400/10 text-amber-300 border-amber-400/30",
      stepActive: "bg-amber-400/12 text-amber-300 border border-amber-400/35",
      platformActive: "bg-amber-400/15 border-amber-400/50 text-amber-200",
      techCardActive: "bg-amber-400/10 border-amber-400/45 text-white",
      userBubble: "bg-amber-400/10 text-zinc-100 border border-amber-400/30",
      draftPanelBorder: "border-amber-400/30",
      draftTitle: "text-amber-300",
      chipActive:
        "bg-amber-400/10 text-amber-200 border-amber-400/30 hover:bg-amber-400/15",
      checkboxActive: "bg-amber-400 border-amber-400",
      primaryBtn: "bg-amber-400 hover:bg-amber-300 text-zinc-950",
      outlineBtn:
        "text-amber-300 bg-amber-400/10 hover:bg-amber-400/15 border-amber-400/30",
      inputFocus: "focus:border-amber-400/60",
      starterHover: "hover:border-amber-400/40",
      starterTitleHover: "group-hover:text-amber-300",
      dot: "bg-amber-400",
      spinner: "text-amber-400",
    },
    starterPrompts: [
      {
        label: "AWS 3-AZ VPC + RDS Postgres + KMS",
        platform: "AWS",
        prompt:
          "Provision AWS Terraform modules with S3 + DynamoDB state locking, a 3-AZ VPC with isolated private subnets, KMS encryption, ECS Fargate, and Multi-AZ RDS PostgreSQL 16.",
      },
      {
        label: "GCP GKE Autopilot + Cloud SQL",
        platform: "Google Cloud",
        prompt:
          "Create Google Cloud Terraform HCL with GCS state backend, custom VPC with secondary pod/service ranges, private GKE Autopilot cluster, Cloud SQL Postgres, and Secret Manager.",
      },
      {
        label: "Azure Hub-Spoke VNet + Private AKS",
        platform: "Azure",
        prompt:
          "Generate Azure Terraform configuration with Azure Blob state locking, VNet subnet delegation, private AKS cluster with Workload Identity, Azure Key Vault, and Flexible Postgres.",
      },
      {
        label: "DigitalOcean DOKS + Managed DB + Spaces",
        platform: "DigitalOcean",
        prompt:
          "Provision DigitalOcean Terraform infrastructure featuring an isolated regional VPC, autoscaling DOKS Kubernetes node pools, Managed PostgreSQL cluster, and Spaces S3 storage.",
      },
    ],
    sampleRepos: [
      {
        label: "terraform-aws-modules/terraform-aws-vpc",
        url: "https://github.com/terraform-aws-modules/terraform-aws-vpc",
        note: "AWS HCL Topology",
      },
      {
        label: "hashicorp/terraform-provider-aws",
        url: "https://github.com/hashicorp/terraform-provider-aws",
        note: "AWS Provider Specs",
      },
      {
        label: "GoogleCloudPlatform/cloud-foundation-fabric",
        url: "https://github.com/GoogleCloudPlatform/cloud-foundation-fabric",
        note: "GCP Terraform Modules",
      },
      {
        label: "Zomma2/VolitionCI",
        url: "https://github.com/Zomma2/VolitionCI",
        note: "App -> Cloud Infra",
      },
    ],
  },

  kubernetes: {
    id: "kubernetes",
    name: "Kubernetes",
    shortLabel: "Kubernetes",
    subtitle: "Hardened workloads, HPA v2 & NetworkPolicy",
    artifact: "k8s/manifests.yaml",
    validationBadge: "Multi-Doc K8s Schema & PodSecurity Gate",
    architectTitle: "Kubernetes Workload & Cluster Policy Architect",
    architectHeadline: "Author hardened Kubernetes workloads, autoscaling, and zero-trust mesh policies",
    architectBrief:
      "Evaluates PodSecurity restricted contexts, CPU/memory resource requests, HPA v2 scaling rules, default-deny NetworkPolicies, TLS Ingress, and GitOps controllers.",
    loadingStatusText:
      "Evaluating PodSecurity baselines, HPA v2 scaling thresholds, and NetworkPolicy isolation...",
    chatPlaceholder:
      "e.g., Generate hardened Amazon EKS manifests for a Go API with non-root PodSecurity, HPA v2, Ingress-Nginx TLS, and NetworkPolicy...",
    scanInspectorNote:
      "Inspects container ports, health endpoints, service dependencies, and Helm/Kustomize folders to synthesize production Kubernetes Deployments, Services, HPA, and NetworkPolicies.",
    accentHex: "#60a5fa",
    classes: {
      topAccentBar: "from-blue-500/80 via-blue-400 to-sky-400/60",
      cardActive:
        "bg-blue-500/[0.11] border-blue-400/50 text-white shadow-[0_0_0_1px_rgba(96,165,250,0.16)]",
      iconActive: "text-blue-400",
      badge: "bg-blue-500/12 text-blue-300 border-blue-400/30",
      stepActive: "bg-blue-500/14 text-blue-200 border border-blue-400/35",
      platformActive: "bg-blue-500/15 border-blue-400/50 text-blue-200",
      techCardActive: "bg-blue-500/12 border-blue-400/45 text-white",
      userBubble: "bg-blue-500/12 text-zinc-100 border border-blue-400/35",
      draftPanelBorder: "border-blue-400/35",
      draftTitle: "text-blue-300",
      chipActive:
        "bg-blue-500/12 text-blue-200 border-blue-400/30 hover:bg-blue-500/18",
      checkboxActive: "bg-blue-400 border-blue-400",
      primaryBtn: "bg-blue-400 hover:bg-blue-300 text-zinc-950",
      outlineBtn:
        "text-blue-300 bg-blue-500/12 hover:bg-blue-500/18 border-blue-400/30",
      inputFocus: "focus:border-blue-400/60",
      starterHover: "hover:border-blue-400/40",
      starterTitleHover: "group-hover:text-blue-300",
      dot: "bg-blue-400",
      spinner: "text-blue-400",
    },
    starterPrompts: [
      {
        label: "Hardened EKS API + HPA v2 + NetworkPolicy",
        platform: "Amazon EKS",
        prompt:
          "Generate hardened Kubernetes manifests on Amazon EKS for a Go REST API with restricted non-root PodSecurity, read-only rootfs, HPA v2, PodDisruptionBudget, and NetworkPolicy.",
      },
      {
        label: "GKE Gateway TLS + Cert-Manager + Prometheus",
        platform: "Google GKE",
        prompt:
          "Create Google GKE manifests for a Node.js web tier and worker deployment with Ingress-Nginx, Cert-Manager Let's Encrypt TLS, Prometheus ServiceMonitor, and ExternalSecrets.",
      },
      {
        label: "Istio mTLS Mesh + ArgoCD GitOps Rollout",
        platform: "Generic Kubernetes",
        prompt:
          "Synthesize Kubernetes manifests with strict Istio PeerAuthentication mTLS, VirtualService canary traffic splitting, ArgoCD Application spec, and resource quota enforcement.",
      },
      {
        label: "Stateful PostgreSQL + Redis on Azure AKS",
        platform: "Azure AKS",
        prompt:
          "Author Azure AKS manifests featuring a StatefulSet with managed CSI PersistentVolumeClaims, headless peer discovery Service, liveness/readiness probes, and backup CronJob.",
      },
    ],
    sampleRepos: [
      {
        label: "GoogleCloudPlatform/microservices-demo",
        url: "https://github.com/GoogleCloudPlatform/microservices-demo",
        note: "Polyglot K8s Mesh",
      },
      {
        label: "stefanprodan/podinfo",
        url: "https://github.com/stefanprodan/podinfo",
        note: "Cloud-Native Go K8s",
      },
      {
        label: "argoproj/argocd-example-apps",
        url: "https://github.com/argoproj/argocd-example-apps",
        note: "Helm & Kustomize",
      },
      {
        label: "Zomma2/VolitionCI",
        url: "https://github.com/Zomma2/VolitionCI",
        note: "Next.js K8s Rollout",
      },
    ],
  },

  docker: {
    id: "docker",
    name: "Docker Compose",
    shortLabel: "Compose",
    subtitle: "Multi-container isolated networks & healthchecks",
    artifact: "docker-compose.yml",
    validationBadge: "Compose Spec v2 & Healthcheck Dependency Gate",
    architectTitle: "Container Runtime & Compose Topology Architect",
    architectHeadline: "Compose isolated multi-container stacks with deterministic healthchecks",
    architectBrief:
      "Evaluates frontend/backend bridge network segmentation, `service_healthy` startup ordering, named volume persistence, memory limits, and non-root container hardening.",
    loadingStatusText:
      "Evaluating container bridge networks, persistent volumes, and healthcheck dependencies...",
    chatPlaceholder:
      "e.g., Create a Docker Compose stack with Nginx, Next.js, Go worker, PostgreSQL 16, and Redis 7 with healthchecks...",
    scanInspectorNote:
      "Inspects Dockerfiles, exposed ports, ORMs, caches, and message brokers in your repository to synthesize a ready-to-boot multi-container `docker-compose.yml`.",
    accentHex: "#34d399",
    classes: {
      topAccentBar: "from-emerald-500/80 via-emerald-400 to-teal-300/60",
      cardActive:
        "bg-emerald-400/[0.09] border-emerald-400/50 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.15)]",
      iconActive: "text-emerald-400",
      badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
      stepActive: "bg-emerald-400/12 text-emerald-300 border border-emerald-400/35",
      platformActive: "bg-emerald-400/15 border-emerald-400/50 text-emerald-200",
      techCardActive: "bg-emerald-400/10 border-emerald-400/45 text-white",
      userBubble: "bg-emerald-400/10 text-zinc-100 border border-emerald-400/30",
      draftPanelBorder: "border-emerald-400/30",
      draftTitle: "text-emerald-300",
      chipActive:
        "bg-emerald-400/10 text-emerald-200 border-emerald-400/30 hover:bg-emerald-400/15",
      checkboxActive: "bg-emerald-400 border-emerald-400",
      primaryBtn: "bg-emerald-400 hover:bg-emerald-300 text-zinc-950",
      outlineBtn:
        "text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/15 border-emerald-400/30",
      inputFocus: "focus:border-emerald-400/60",
      starterHover: "hover:border-emerald-400/40",
      starterTitleHover: "group-hover:text-emerald-300",
      dot: "bg-emerald-400",
      spinner: "text-emerald-400",
    },
    starterPrompts: [
      {
        label: "Nginx + Node.js + Go + Postgres + Redis",
        platform: "Local Development",
        prompt:
          "Create a Docker Compose stack with Nginx reverse proxy, Node.js web app, Go worker API, PostgreSQL 16, and Redis 7 using isolated frontend/backend networks and healthchecks.",
      },
      {
        label: "Event-Driven Python + Kafka + MongoDB",
        platform: "Production Swarm",
        prompt:
          "Synthesize a production-hardened Docker Compose topology for Python FastAPI producers/consumers, Apache Kafka in KRaft mode, MongoDB 7 with named volumes, and resource limits.",
      },
      {
        label: "Full Observability Stack (Prometheus + Grafana)",
        platform: "Production Swarm",
        prompt:
          "Build a Docker Compose stack with Traefik reverse proxy, a Go API instrumented with OpenTelemetry, Prometheus scraper, Grafana provisioned dashboards, and Redis cache.",
      },
      {
        label: "Ephemeral CI Integration Test Stack",
        platform: "Testing / CI",
        prompt:
          "Generate a fast ephemeral Docker Compose CI test environment running PostgreSQL 16 tmpfs, Redis, RabbitMQ with management healthchecks, and a database migration runner.",
      },
    ],
    sampleRepos: [
      {
        label: "docker/awesome-compose",
        url: "https://github.com/docker/awesome-compose",
        note: "Multi-Service Stacks",
      },
      {
        label: "fastapi/full-stack-fastapi-template",
        url: "https://github.com/fastapi/full-stack-fastapi-template",
        note: "FastAPI + Postgres + Traefik",
      },
      {
        label: "getsentry/self-hosted",
        url: "https://github.com/getsentry/self-hosted",
        note: "Complex Compose Topology",
      },
      {
        label: "Zomma2/VolitionCI",
        url: "https://github.com/Zomma2/VolitionCI",
        note: "Containerized Web App",
      },
    ],
  },
};
