/**
 * src/lib/prompts.ts
 *
 * Advanced prompt engineering module for CI/CD pipeline generation.
 *
 * Builds provider-specific, infrastructure-aware system and user prompts
 * with structured formatting constraints, security best practices, and
 * output-shape guidance. Each CI/CD provider gets tailored instructions
 * including correct file naming, syntax specifics, and idiomatic patterns.
 */

import type { CIProvider, Infrastructure, RepoType, OutputType } from "@/types/pipeline";

// ---------------------------------------------------------------------------
// Provider-specific knowledge base
// ---------------------------------------------------------------------------

const PROVIDER_KNOWLEDGE: Record<CIProvider, {
  fileName: string;
  syntaxName: string;
  topLevelKeys: string;
  bestPractices: string[];
  structureGuide: string;
}> = {
  "GitHub Actions": {
    fileName: ".github/workflows/ci.yml",
    syntaxName: "GitHub Actions workflow YAML",
    topLevelKeys: "`name`, `on`, `permissions`, `env`, `jobs`",
    bestPractices: [
      "Pin action versions to full SHA hashes (e.g. actions/checkout@<sha>) for supply-chain security",
      "Use `permissions` block with least privilege (e.g. `contents: read`)",
      "Use `concurrency` groups to cancel redundant workflow runs on the same branch",
      "Cache dependencies using actions/cache or built-in caching for faster runs",
      "Use reusable workflows or composite actions for DRY patterns in monorepos",
      "Use `environment` for deployment protection rules on production jobs",
      "Use OIDC (`id-token: write`) instead of long-lived credentials for cloud auth",
      "Use matrix strategy for parallel testing across multiple versions",
    ],
    structureGuide: `Structure the workflow as:
1. A top-level \`name\` describing the pipeline purpose
2. An \`on\` block specifying triggers (push, pull_request, workflow_dispatch)
3. A \`permissions\` block with least-privilege scoping
4. Jobs in logical stages: lint → test → build → deploy
5. Each job specifies \`runs-on\`, \`steps\`, and appropriate \`needs\` for ordering`,
  },
  "GitLab CI": {
    fileName: ".gitlab-ci.yml",
    syntaxName: "GitLab CI/CD pipeline YAML",
    topLevelKeys: "`stages`, `variables`, `default`, `include`, job definitions",
    bestPractices: [
      "Define explicit `stages` in order of execution",
      "Use `rules` (not `only/except` which are deprecated) for job conditions",
      "Use `cache` with `key: $CI_COMMIT_REF_SLUG` for branch-specific dependency caching",
      "Use `artifacts` with `expire_in` to store build outputs between stages",
      "Use `extends` or `include` for reusable job templates",
      "Use `needs` for Directed Acyclic Graph (DAG) execution to parallelize independent jobs",
      "Use `environment` with `url` and `auto_stop_in` for review apps",
      "Use `!reference` tags to reuse script fragments",
    ],
    structureGuide: `Structure the pipeline as:
1. A \`stages\` list defining execution order (e.g. lint, test, build, deploy)
2. A \`default\` block for shared settings (image, retry, interruptible)
3. A \`variables\` block for global environment variables
4. Individual jobs grouped by stage with \`rules\` for conditional execution
5. Deployment jobs with \`environment\`, \`when: manual\` for production`,
  },
  "Bitbucket Pipelines": {
    fileName: "bitbucket-pipelines.yml",
    syntaxName: "Bitbucket Pipelines YAML",
    topLevelKeys: "`image`, `definitions`, `pipelines`",
    bestPractices: [
      "Define reusable steps in `definitions.steps` and reference with `*step-name`",
      "Use `caches` (predefined like `node`, `pip`, or custom paths) for speed",
      "Use `services` block for databases or Docker-in-Docker",
      "Use `deployment` keyword for environment tracking",
      "Use `parallel` steps where jobs are independent",
      "Use `condition.changesets.includePaths` for path-based triggering in monorepos",
      "Set `size: 2x` for memory-intensive build steps",
    ],
    structureGuide: `Structure the pipeline as:
1. A default \`image\` for all steps
2. \`definitions\` for reusable steps, caches, and services
3. \`pipelines.default\` for all-branch execution
4. \`pipelines.branches\` for branch-specific flows (main, develop)
5. \`pipelines.pull-requests\` for PR validation`,
  },
  "CircleCI": {
    fileName: ".circleci/config.yml",
    syntaxName: "CircleCI configuration YAML",
    topLevelKeys: "`version`, `orbs`, `executors`, `commands`, `jobs`, `workflows`",
    bestPractices: [
      "Use `version: 2.1` for orbs, commands, and executors support",
      "Use official orbs (e.g. circleci/node, circleci/docker) for common tasks",
      "Define reusable `commands` for shared step sequences",
      "Define `executors` for consistent job environments",
      "Use `persist_to_workspace` / `attach_workspace` for sharing artifacts between jobs",
      "Use `filters.branches` on workflows for deployment gating",
      "Use `context` for secure environment variable management",
    ],
    structureGuide: `Structure the config as:
1. \`version: 2.1\`
2. \`orbs\` for third-party integrations
3. \`executors\` for reusable environment definitions
4. \`commands\` for reusable step sequences
5. \`jobs\` with logical names and appropriate executors
6. \`workflows\` orchestrating jobs with \`requires\` for ordering`,
  },
  "Jenkins": {
    fileName: "Jenkinsfile",
    syntaxName: "Jenkins Declarative Pipeline (Groovy DSL)",
    topLevelKeys: "`pipeline`, `agent`, `environment`, `stages`, `post`",
    bestPractices: [
      "Use Declarative Pipeline syntax (not Scripted) for readability and linting",
      "Use `agent { docker { image '...' } }` for consistent build environments",
      "Use `environment` block for credentials binding: `credentials('...')`",
      "Use `when` conditions for stage-level gating (branch, expression, changeset)",
      "Use `parallel` within a stage for concurrent execution",
      "Use `post` blocks for cleanup, notifications (always, success, failure)",
      "Use `options { timeout(time: 30, unit: 'MINUTES') }` to prevent stuck builds",
      "Use `stash/unstash` for sharing files between stages on different agents",
    ],
    structureGuide: `Structure the Jenkinsfile as:
1. \`pipeline\` wrapper
2. \`agent\` block (Docker-based for reproducibility)
3. \`options\` for timeout, retry, build discarder
4. \`environment\` for credentials and variables
5. \`stages\` in order: Checkout → Lint → Test → Build → Deploy
6. \`post\` block for cleanup and Slack/email notifications`,
  },
};

// ---------------------------------------------------------------------------
// Infrastructure-specific prompt fragments
// ---------------------------------------------------------------------------

const INFRA_FRAGMENTS: Record<Infrastructure, string> = {
  Docker: `Docker Requirements:
- Include a multi-stage Docker build step for minimal image size
- Use BuildKit features (DOCKER_BUILDKIT=1)
- Tag images with both the commit SHA and 'latest'
- Push to a container registry (use placeholder registry.example.com if no registry specified)
- Include a security scan step (e.g. Trivy, Snyk) for the built image
- Use Docker layer caching for faster rebuilds`,

  Kubernetes: `Kubernetes Requirements:
- Include kubectl or kustomize apply steps for deployment
- Use namespaced deployments with environment-specific contexts
- Include a health check / rollout status verification step
- Reference Kubernetes manifests in a k8s/ or deploy/ directory
- Include image tag substitution using kustomize edit or envsubst
- Add a rollback step on deployment failure`,

  AWS: `AWS Requirements:
- Use OIDC authentication (assume role) instead of static access keys where possible
- Configure AWS region as an environment variable
- Use aws-actions/configure-aws-credentials (GitHub) or equivalent
- Include ECR login for container pushes if Docker is used
- Use S3 for artifact storage if applicable
- Reference AWS account IDs as CI/CD variables, never hardcoded`,

  GCP: `GCP Requirements:
- Use Workload Identity Federation for keyless authentication where possible
- Configure gcloud CLI authentication step
- Use Artifact Registry or GCR for container images
- Reference GCP project ID as a CI/CD variable
- Use Cloud Build or direct gcloud commands for deployments
- Include gke-auth for GKE cluster access if Kubernetes is used`,

  Azure: `Azure Requirements:
- Use Azure Service Principal or OIDC for authentication
- Configure Azure CLI (az login) step
- Use Azure Container Registry (ACR) for Docker images
- Reference Azure subscription and resource group as variables
- Use AKS credentials for Kubernetes if applicable
- Include Azure DevOps integration where relevant`,

  Terraform: `Terraform Requirements:
- Include terraform init, validate, plan, and apply steps
- Use a remote backend (S3, GCS, Azure Blob) for state management
- Store the plan output as an artifact between stages
- Separate plan and apply into distinct stages with manual approval for apply
- Use terraform fmt -check for formatting validation
- Pin the Terraform version in the pipeline
- Use -auto-approve only in non-production environments`,

  Helm: `Helm Requirements:
- Include helm repo add and helm repo update steps
- Use helm upgrade --install for idempotent deployments
- Reference values files per environment (values-dev.yaml, values-prod.yaml)
- Include helm lint and helm template validation steps
- Use --atomic flag for automatic rollback on failure
- Pin chart versions in production deployments`,

  ArgoCD: `ArgoCD Requirements:
- Structure as a GitOps workflow: pipeline updates manifests, ArgoCD syncs
- Include a step to update image tags in the GitOps repository
- Use argocd app sync --prune for cleanup of removed resources
- Include health check verification (argocd app wait)
- Separate the CI pipeline (build/test/push) from CD (ArgoCD sync)
- Reference the ArgoCD server and app name as CI/CD variables`,
};

// ---------------------------------------------------------------------------
// Monorepo-specific guidance
// ---------------------------------------------------------------------------

const MONOREPO_GUIDANCE = `Monorepo Optimization:
- Use path-based filtering to only trigger builds for changed packages
- Include a step to detect which packages/services changed
- Use parallel/matrix jobs to build changed services independently
- Cache dependencies at the workspace root level
- Use workspace-aware package managers (npm workspaces, pnpm, yarn workspaces, Turborepo)
- Fan-out build steps and fan-in for final deployment gate`;

const POLYREPO_GUIDANCE = `Single-Service Repository Pattern:
- Pipeline is scoped to a single service/application
- Include clear stage separation: lint → test → build → deploy
- Use branch-based deployment strategies (develop → staging, main → production)
- Include automated version bumping or changelog generation where appropriate`;

// ---------------------------------------------------------------------------
// Output type configurations
// ---------------------------------------------------------------------------

const OUTPUT_TYPE_CONFIG: Record<OutputType, {
  label: string;
  systemContext: string;
  outputFormat: string;
}> = {
  "ci-pipeline": {
    label: "CI/CD Pipeline",
    systemContext: "You are generating a CI/CD pipeline configuration file.",
    outputFormat: "YAML",
  },
  "dockerfile": {
    label: "Dockerfile",
    systemContext: "You are generating a production-ready, multi-stage Dockerfile.",
    outputFormat: "Dockerfile syntax (not YAML)",
  },
  "docker-compose": {
    label: "Docker Compose",
    systemContext: "You are generating a Docker Compose file for local development and/or production.",
    outputFormat: "YAML (docker-compose format)",
  },
  "proxy-config": {
    label: "Proxy / Load Balancer Configuration",
    systemContext: "You are generating a reverse proxy and load balancer configuration. Use Nginx by default unless the user specifies HAProxy or another proxy.",
    outputFormat: "Nginx config syntax (or HAProxy config if specified)",
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface PromptPayload {
  systemPrompt: string;
  userPrompt: string;
}

export function buildPrompts(params: {
  repoType: RepoType;
  ciProvider: CIProvider;
  infrastructure: Infrastructure[];
  customRequirements: string;
  outputType: OutputType;
  baseImage?: string;
  databases?: string[];
  proxyServer?: string;
}): PromptPayload {
  const { repoType, ciProvider, infrastructure, customRequirements, outputType, baseImage, databases, proxyServer } = params;
  
  // Provide safe fallbacks since provider might not apply if it's not a ci-pipeline
  const provider = PROVIDER_KNOWLEDGE[ciProvider] || PROVIDER_KNOWLEDGE["GitHub Actions"];
  const outputConfig = OUTPUT_TYPE_CONFIG[outputType];

  // ── System Prompt ─────────────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(provider, outputConfig, outputType);

  // ── User Prompt ───────────────────────────────────────────────────────────
  const userPrompt = buildUserPrompt({
    repoType,
    ciProvider,
    infrastructure,
    customRequirements,
    outputType,
    provider,
    outputConfig,
    baseImage,
    databases,
    proxyServer,
  });

  return { systemPrompt, userPrompt };
}

// ---------------------------------------------------------------------------
// Internal builders
// ---------------------------------------------------------------------------

function buildSystemPrompt(
  provider: typeof PROVIDER_KNOWLEDGE[CIProvider],
  outputConfig: typeof OUTPUT_TYPE_CONFIG[OutputType],
  outputType: OutputType
): string {
  const lines: string[] = [];

  lines.push(`You are a world-class DevOps and Platform Engineering specialist with 15+ years of production experience across enterprise and startup environments.`);
  lines.push(``);
  lines.push(outputConfig.systemContext);
  lines.push(``);

  // Output format enforcement
  lines.push(`## OUTPUT FORMAT RULES (CRITICAL — VIOLATING THESE RULES IS FAILURE)`);
  lines.push(`1. Output ONLY the raw configuration content — no surrounding text`);
  lines.push(`2. Do NOT wrap output in markdown code fences (\`\`\`yaml, \`\`\`, etc.)`);
  lines.push(`3. Do NOT include any conversational text, greetings, or explanations`);
  lines.push(`4. Do NOT include phrases like "Here is..." or "This configuration..."`);
  lines.push(`5. The first character of your output must be the first character of the configuration`);
  lines.push(`6. The last character of your output must be the last character of the configuration`);
  lines.push(`7. Output format: ${outputConfig.outputFormat}`);
  lines.push(``);

  // Provider-specific context for pipeline outputs
  if (outputType === "ci-pipeline") {
    lines.push(`## PROVIDER CONTEXT`);
    lines.push(`- Target platform: ${provider.syntaxName}`);
    lines.push(`- File should be saved as: ${provider.fileName}`);
    lines.push(`- Expected top-level keys: ${provider.topLevelKeys}`);
    lines.push(``);
    lines.push(`## ${provider.syntaxName.toUpperCase()} BEST PRACTICES`);
    provider.bestPractices.forEach((bp, i) => {
      lines.push(`${i + 1}. ${bp}`);
    });
    lines.push(``);
    lines.push(`## STRUCTURE GUIDE`);
    lines.push(provider.structureGuide);
    lines.push(``);
  }

  // Security always applies
  lines.push(`## SECURITY REQUIREMENTS`);
  lines.push(`- Never hardcode secrets, tokens, or credentials in the configuration`);
  lines.push(`- Use CI/CD variables or secret management for sensitive values`);
  lines.push(`- Use specific version tags/SHAs for all third-party actions, images, and tools`);
  lines.push(`- Include at minimum one security scanning step (SAST, container scan, or dependency audit)`);
  lines.push(`- Apply principle of least privilege for all permissions and service accounts`);
  lines.push(``);

  // Quality standards
  lines.push(`## QUALITY STANDARDS`);
  lines.push(`- Output must be syntactically valid and immediately usable without modification`);
  lines.push(`- Include inline comments (using #) explaining non-obvious configuration choices`);
  lines.push(`- Use descriptive, lowercase-kebab-case names for jobs/stages/steps`);
  lines.push(`- Include appropriate timeout and retry configurations`);
  lines.push(`- Optimize for CI/CD speed: parallelize where possible, cache aggressively`);

  return lines.join("\n");
}

function buildUserPrompt(params: {
  repoType: RepoType;
  ciProvider: CIProvider;
  infrastructure: Infrastructure[];
  customRequirements: string;
  outputType: OutputType;
  provider: typeof PROVIDER_KNOWLEDGE[CIProvider];
  outputConfig: typeof OUTPUT_TYPE_CONFIG[OutputType];
  baseImage?: string;
  databases?: string[];
  proxyServer?: string;
}): string {
  const { repoType, ciProvider, infrastructure, customRequirements, outputType, provider, outputConfig, baseImage, databases, proxyServer } = params;
  const lines: string[] = [];

  // What to generate
  if (outputType === "ci-pipeline") {
    lines.push(`Generate a complete, production-grade ${ciProvider} CI/CD pipeline.`);
    lines.push(`The file is: ${provider.fileName}`);
    lines.push(``);
    lines.push(`## Architecture Context`);
    lines.push(`- Repository structure: ${repoType}`);
    lines.push(`- Technology stack: ${infrastructure.length > 0 ? infrastructure.join(", ") : "Generic"}`);
    lines.push(``);
    lines.push(repoType === "Monorepo" ? MONOREPO_GUIDANCE : POLYREPO_GUIDANCE);
    lines.push(``);
    if (infrastructure.length > 0) {
      lines.push(`## Infrastructure-Specific Requirements`);
      infrastructure.forEach((infra) => {
        if (INFRA_FRAGMENTS[infra]) {
          lines.push(``);
          lines.push(INFRA_FRAGMENTS[infra]);
        }
      });
      lines.push(``);
    }
  } else if (outputType === "dockerfile") {
    lines.push(`Generate a production-grade, multi-stage Dockerfile.`);
    lines.push(`## Architecture Context`);
    lines.push(`- Base Tech Stack: ${baseImage || "Generic"}`);
    lines.push(`- Use a multi-stage build pattern to keep the final image minimal.`);
    lines.push(`- Do not run the application as root in the final container.`);
    lines.push(``);
  } else if (outputType === "docker-compose") {
    lines.push(`Generate a production-grade Docker Compose file (docker-compose.yml).`);
    lines.push(`## Architecture Context`);
    lines.push(`- Included Databases / Services: ${databases && databases.length > 0 ? databases.join(", ") : "None specified"}`);
    lines.push(`- Provide environment variables, named volumes for data persistence, and healthchecks for each service.`);
    lines.push(``);
  } else if (outputType === "proxy-config") {
    lines.push(`Generate a production-grade reverse proxy / load balancer configuration.`);
    lines.push(`## Architecture Context`);
    lines.push(`- Proxy Server: ${proxyServer || "Nginx"}`);
    lines.push(`- Include best practices for gzip, SSL/TLS, security headers (HSTS, CSP), and connection timeouts.`);
    lines.push(``);
  }

  // Custom requirements
  if (customRequirements.trim()) {
    lines.push(`## Custom Requirements (HIGH PRIORITY — must be incorporated)`);
    lines.push(customRequirements.trim());
    lines.push(``);
  }

  // Final reinforcement
  lines.push(`## FINAL REMINDER`);
  lines.push(`Output ONLY the raw ${outputConfig.outputFormat} configuration content.`);
  lines.push(`No markdown fences. No explanations. No preamble. Start directly with the configuration.`);

  return lines.join("\n");
}

