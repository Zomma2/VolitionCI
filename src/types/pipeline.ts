/**
 * src/types/pipeline.ts
 *
 * Shared TypeScript types for the CI/CD pipeline generator.
 */

export type RepoType = "Monorepo" | "Polyrepo";

export type CIProvider =
  | "GitHub Actions"
  | "GitLab CI"
  | "Bitbucket Pipelines"
  | "CircleCI"
  | "Jenkins";

export type Infrastructure =
  | "Docker"
  | "Kubernetes"
  | "AWS"
  | "GCP"
  | "Azure"
  | "Terraform"
  | "Helm"
  | "ArgoCD";

export type OutputType =
  | "ci-pipeline"
  | "dockerfile"
  | "docker-compose"
  | "proxy-config";

export type BaseImage = "Node.js" | "Python" | "Go" | "Java" | "Rust" | "Ruby" | "PHP" | "Generic";

export type Database = "PostgreSQL" | "MySQL" | "MongoDB" | "Redis" | "Elasticsearch" | "RabbitMQ";

export type ProxyServer = "Nginx" | "HAProxy" | "Traefik" | "Apache" | "Caddy";

export interface PipelineFormData {
  outputType: OutputType;
  customRequirements: string;
  
  // CI/CD Pipeline specific
  repoType: RepoType;
  ciProvider: CIProvider;
  infrastructure: Infrastructure[];
  
  // Dockerfile specific
  baseImage: BaseImage;
  
  // Docker Compose specific
  databases: Database[];
  
  // Proxy Config specific
  proxyServer: ProxyServer;
}

export interface GenerationState {
  status: "idle" | "queued" | "generating" | "success" | "error";
  output: string;
  errorMessage: string;
}
