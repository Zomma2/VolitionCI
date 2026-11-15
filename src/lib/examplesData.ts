import { Archetype } from "@/store/useWizardStore";

export interface ExampleBlueprint {
  id: string;
  title: string;
  summary: string;
  archetype: Archetype;
  targetPlatform: string;
  fileName: string;
  filePath: string;
  language: "yaml" | "hcl";
  tags: string[];
  highlights: string[];
  starterPrompt: string;
  code: string;
}

export const EXAMPLE_BLUEPRINTS: ExampleBlueprint[] = [
  {
    id: "nextjs-aws-ecs-gha",
    title: "Zero-Trust Next.js & Prisma to AWS ECS",
    summary:
      "Production GitHub Actions pipeline with keyless AWS OIDC authentication, Semgrep SAST, Trivy container scanning, Prisma migrations, and rolling ECS service deployment.",
    archetype: "pipeline",
    targetPlatform: "GitHub Actions",
    fileName: "deploy-ecs.yml",
    filePath: ".github/workflows/deploy-ecs.yml",
    language: "yaml",
    tags: ["Next.js", "Prisma", "AWS ECS", "OIDC", "Trivy", "Semgrep"],
    highlights: [
      "Keyless AWS IAM role assumption via OIDC (no static long-lived secrets)",
      "Parallel Semgrep SAST + npm audit gate prior to container build",
      "Trivy CRITICAL/HIGH vulnerability gate on built ECR image",
    ],
    starterPrompt:
      "Create a zero-trust GitHub Actions CI/CD pipeline for a Next.js and Prisma PostgreSQL app deploying to AWS ECS via ECR with OIDC, Semgrep, and Trivy.",
    code: `name: Production ECS Delivery

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  id-token: write
  contents: read
  security-events: write

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: volition-web
  ECS_CLUSTER: production-core
  ECS_SERVICE: volition-web-svc
  NODE_VERSION: "22"

jobs:
  quality-and-sast:
    name: Static Analysis & Unit Suite
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: npm

      - name: Install deterministic dependencies
        run: npm ci

      - name: Validate Prisma schema & types
        run: |
          npx prisma validate
          npm run lint
          npx tsc --noEmit

      - name: Run Semgrep SAST scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/typescript p/nextjs p/owasp-top-ten

  build-scan-deploy:
    name: Build, Scan & Rollout ECS
    needs: [quality-and-sast]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source
        uses: actions/checkout@v4

      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_OIDC_DEPLOY_ROLE_ARN }}
          aws-region: \${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build release container image
        env:
          REGISTRY: \${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: \${{ github.sha }}
        run: |
          docker build \\
            --build-arg GIT_SHA=\${IMAGE_TAG} \\
            -t \${REGISTRY}/\${ECR_REPOSITORY}:\${IMAGE_TAG} .

      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: \${{ steps.login-ecr.outputs.registry }}/\${{ env.ECR_REPOSITORY }}:\${{ github.sha }}
          format: table
          exit-code: "1"
          ignore-unfixed: true
          vuln-type: os,library
          severity: CRITICAL,HIGH

      - name: Push verified image to ECR
        env:
          REGISTRY: \${{ steps.login-ecr.outputs.registry }}
        run: docker push \${REGISTRY}/\${ECR_REPOSITORY}:\${{ github.sha }}

      - name: Run Prisma production migrations
        env:
          DATABASE_URL: \${{ secrets.PROD_DATABASE_URL }}
        run: |
          npm ci --ignore-scripts
          npx prisma migrate deploy

      - name: Update ECS task definition & await stability
        run: |
          aws ecs update-service \\
            --cluster \${ECS_CLUSTER} \\
            --service \${ECS_SERVICE} \\
            --force-new-deployment
          aws ecs wait services-stable \\
            --cluster \${ECS_CLUSTER} \\
            --services \${ECS_SERVICE}`,
  },
  {
    id: "aws-vpc-eks-rds-terraform",
    title: "Multi-AZ AWS VPC, EKS & Encrypted RDS PostgreSQL",
    summary:
      "Modular Terraform HCL provisioning an isolated 3-AZ VPC, private subnets, KMS-encrypted RDS PostgreSQL 16 instance, and least-privilege IAM roles with remote S3 state locking.",
    archetype: "terraform",
    targetPlatform: "AWS",
    fileName: "main.tf",
    filePath: "infra/aws/main.tf",
    language: "hcl",
    tags: ["Terraform", "AWS VPC", "RDS PostgreSQL", "KMS", "S3 State"],
    highlights: [
      "Encrypted S3 remote state backend with DynamoDB lock table",
      "Strict private database subnet group isolated from public ingress",
      "Customer-managed KMS key rotation enabled for storage at rest",
    ],
    starterPrompt:
      "Provision a production AWS Terraform topology with S3 remote state locking, multi-AZ VPC, private subnets, KMS encryption, and Multi-AZ RDS PostgreSQL 16.",
    code: `terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  backend "s3" {
    bucket         = "volition-prod-terraform-state"
    key            = "core/network-and-data/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "volition-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
      System      = "VolitionCI"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

resource "aws_kms_key" "data_encryption" {
  description             = "KMS key for RDS and secret encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_vpc" "core" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "\${var.environment}-core-vpc"
  }
}

resource "aws_subnet" "private_data_a" {
  vpc_id                  = aws_vpc.core.id
  cidr_block              = "10.20.10.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = {
    Name = "\${var.environment}-private-data-a"
    Tier = "database"
  }
}

resource "aws_subnet" "private_data_b" {
  vpc_id                  = aws_vpc.core.id
  cidr_block              = "10.20.11.0/24"
  availability_zone       = "\${var.aws_region}b"
  map_public_ip_on_launch = false

  tags = {
    Name = "\${var.environment}-private-data-b"
    Tier = "database"
  }
}

resource "aws_security_group" "rds_isolated" {
  name        = "\${var.environment}-rds-sg"
  description = "Allow PostgreSQL strictly from internal VPC workloads"
  vpc_id      = aws_vpc.core.id

  ingress {
    description = "PostgreSQL from private compute tier"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.20.0.0/20"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "postgres" {
  name       = "\${var.environment}-postgres-subnets"
  subnet_ids = [aws_subnet.private_data_a.id, aws_subnet.private_data_b.id]
}

resource "aws_db_instance" "primary" {
  identifier                  = "\${var.environment}-core-postgres"
  engine                      = "postgres"
  engine_version              = "16.3"
  instance_class              = "db.t4g.medium"
  allocated_storage           = 100
  max_allocated_storage       = 500
  storage_type                = "gp3"
  storage_encrypted           = true
  kms_key_id                  = aws_kms_key.data_encryption.arn
  multi_az                    = true
  db_subnet_group_name        = aws_db_subnet_group.postgres.name
  vpc_security_group_ids      = [aws_security_group.rds_isolated.id]
  username                    = var.db_username
  password                    = var.db_password
  backup_retention_period     = 14
  deletion_protection         = true
  skip_final_snapshot         = false
  final_snapshot_identifier   = "\${var.environment}-postgres-final"
  auto_minor_version_upgrade  = true
  publicly_accessible         = false
}

output "vpc_id" {
  value = aws_vpc.core.id
}

output "rds_endpoint" {
  value     = aws_db_instance.primary.address
  sensitive = true
}`,
  },
  {
    id: "k8s-hardened-microservice",
    title: "Hardened Kubernetes Workload, HPA & NetworkPolicy",
    summary:
      "Multi-document Kubernetes specification enforcing non-root PodSecurity, read-only root filesystem, readiness/liveness probes, CPU/memory HPA scaling, TLS Ingress, and default-deny ingress traffic isolation.",
    archetype: "kubernetes",
    targetPlatform: "Amazon EKS",
    fileName: "k8s-manifests.yaml",
    filePath: "k8s/production/workload.yaml",
    language: "yaml",
    tags: ["Kubernetes", "EKS", "HPA", "NetworkPolicy", "Cert-Manager"],
    highlights: [
      "Non-root UID 10001 with dropped Linux ALL capabilities and readOnlyRootFilesystem",
      "HorizontalPodAutoscaler v2 with controlled scale-down stabilization window",
      "Strict NetworkPolicy limiting ingress exclusively to ingress-nginx namespace",
    ],
    starterPrompt:
      "Generate hardened Kubernetes manifests for an API service on Amazon EKS with non-root securityContext, HPA v2 autoscaling, TLS Ingress with cert-manager, and NetworkPolicy.",
    code: `apiVersion: v1
kind: Namespace
metadata:
  name: payments-prod
  labels:
    pod-security.kubernetes.io/enforce: restricted
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ledger-api
  namespace: payments-prod
  labels:
    app.kubernetes.io/name: ledger-api
    app.kubernetes.io/part-of: core-banking
spec:
  replicas: 3
  revisionHistoryLimit: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app.kubernetes.io/name: ledger-api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: ledger-api
    spec:
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: ledger-api
          image: ghcr.io/org/ledger-api:1.14.2
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: "1"
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /healthz/ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz/live
              port: http
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: ledger-api
  namespace: payments-prod
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: ledger-api
  ports:
    - name: http
      port: 80
      targetPort: http
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ledger-api-hpa
  namespace: payments-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ledger-api
  minReplicas: 3
  maxReplicas: 15
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ledger-api-isolation
  namespace: payments-prod
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: ledger-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: postgres-proxy
      ports:
        - protocol: TCP
          port: 5432`,
  },
  {
    id: "polyglot-docker-compose-stack",
    title: "Polyglot Web, Go Worker, PostgreSQL 16 & Redis 7",
    summary:
      "Deterministic multi-container Docker Compose topology with condition-based healthcheck startup ordering, segmented frontend/backend bridge networks, and persistent volumes.",
    archetype: "docker",
    targetPlatform: "Local Development",
    fileName: "docker-compose.yml",
    filePath: "docker-compose.yml",
    language: "yaml",
    tags: ["Docker Compose", "Go", "PostgreSQL", "Redis", "Nginx"],
    highlights: [
      "Healthcheck-gated dependency ordering (service_healthy) prevents boot race conditions",
      "Segmented edge and data networks keep PostgreSQL & Redis unreachable from reverse proxy",
      "Resource reservations and bounded JSON file log rotation configured",
    ],
    starterPrompt:
      "Build a Docker Compose setup with Nginx reverse proxy, Node.js web frontend, Go API worker, PostgreSQL 16, and Redis 7 using healthchecks and isolated networks.",
    code: `name: volition-polyglot-stack

services:
  gateway:
    image: nginx:1.27-alpine
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      web:
        condition: service_healthy
      api:
        condition: service_healthy
    networks:
      - edge_net
    read_only: true
    tmpfs:
      - /var/cache/nginx
      - /var/run

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      NODE_ENV: production
      INTERNAL_API_URL: http://api:4000
    expose:
      - "3000"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:3000/api/health"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - edge_net

  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      PORT: "4000"
      DATABASE_URL: postgres://app_user:\${POSTGRES_PASSWORD:-local_dev_secret}@postgres:5432/core_db?sslmode=disable
      REDIS_ADDR: redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:4000/healthz"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - edge_net
      - data_net

  postgres:
    image: postgres:16.4-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-local_dev_secret}
      POSTGRES_DB: core_db
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d core_db"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - data_net

  redis:
    image: redis:7.4-alpine
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - data_net

networks:
  edge_net:
    driver: bridge
  data_net:
    driver: bridge
    internal: true

volumes:
  pg_data:
  redis_data:`,
  },
  {
    id: "gitlab-go-sbom-cosign",
    title: "GitLab CI Go Service with Syft SBOM & Cosign Signing",
    summary:
      "Supply-chain hardened GitLab CI pipeline running Go race-detector tests, Gitleaks secret detection, CycloneDX SBOM generation via Syft, and keyless Cosign container signing.",
    archetype: "pipeline",
    targetPlatform: "GitLab CI",
    fileName: ".gitlab-ci.yml",
    filePath: ".gitlab-ci.yml",
    language: "yaml",
    tags: ["GitLab CI", "Go", "Cosign", "Syft SBOM", "Gitleaks"],
    highlights: [
      "Race-condition test suite and Gitleaks commit history audit",
      "CycloneDX SBOM artifact attached to every release build",
      "Keyless Sigstore Cosign OIDC signature bound to GitLab CI JWT",
    ],
    starterPrompt:
      "Create a GitLab CI pipeline for a Go microservice with race-detector tests, Gitleaks secret scanning, Syft SBOM generation, and keyless Cosign image signing.",
    code: `stages:
  - verify
  - build
  - sign

variables:
  GO_VERSION: "1.23"
  IMAGE_REF: \$CI_REGISTRY_IMAGE:\$CI_COMMIT_SHA

gitleaks-audit:
  stage: verify
  image:
    name: zricethezav/gitleaks:v8.21.2
    entrypoint: [""]
  script:
    - gitleaks detect --source . --verbose --redact

go-test-race:
  stage: verify
  image: golang:\${GO_VERSION}-alpine
  before_script:
    - apk add --no-cache gcc musl-dev
  script:
    - go vet ./...
    - CGO_ENABLED=1 go test -race -coverprofile=coverage.out ./...
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.out

container-and-sbom:
  stage: build
  image: docker:27.2
  services:
    - docker:27.2-dind
  before_script:
    - docker login -u "\$CI_REGISTRY_USER" -p "\$CI_REGISTRY_PASSWORD" "\$CI_REGISTRY"
    - wget -qO- https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
  script:
    - docker build --pull -t "\$IMAGE_REF" .
    - syft "\$IMAGE_REF" -o cyclonedx-json=sbom.cdx.json
    - docker push "\$IMAGE_REF"
  artifacts:
    paths:
      - sbom.cdx.json
    expire_in: 30 days

cosign-attest:
  stage: sign
  needs: [container-and-sbom]
  if: \$CI_COMMIT_BRANCH == \$CI_DEFAULT_BRANCH
  image:
    name: gcr.io/projectsigstore/cosign:v2.4.1
    entrypoint: [""]
  id_tokens:
    SIGSTORE_ID_TOKEN:
      aud: sigstore
  script:
    - cosign login "\$CI_REGISTRY" -u "\$CI_REGISTRY_USER" -p "\$CI_REGISTRY_PASSWORD"
    - cosign sign --yes "\$IMAGE_REF"`,
  },
  {
    id: "gcp-cloud-run-sql-terraform",
    title: "GCP Cloud Run, Serverless VPC & Secret Manager",
    summary:
      "Google Cloud Terraform stack deploying an autoscaled Cloud Run v2 service with dedicated least-privilege service accounts, Secret Manager injection, and private VPC egress.",
    archetype: "terraform",
    targetPlatform: "Google Cloud",
    fileName: "cloudrun.tf",
    filePath: "infra/gcp/cloudrun.tf",
    language: "hcl",
    tags: ["Terraform", "Google Cloud", "Cloud Run", "Secret Manager", "IAM"],
    highlights: [
      "Dedicated workload service account with granular Secret Manager SecretAccessor binding",
      "Cloud Run v2 Direct VPC egress routing private traffic without NAT bottlenecks",
      "Zero plaintext secrets stored in Terraform variables or container environment specs",
    ],
    starterPrompt:
      "Generate Google Cloud Terraform HCL for a Cloud Run v2 API connected to a private VPC network with least-privilege IAM and Secret Manager secret injection.",
    code: `terraform {
  required_version = ">= 1.7.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.4"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "container_image" {
  type = string
}

resource "google_compute_network" "serverless_vpc" {
  name                    = "volition-serverless-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "run_egress" {
  name                     = "volition-run-egress-subnet"
  ip_cidr_range            = "10.40.0.0/24"
  region                   = var.region
  network                  = google_compute_network.serverless_vpc.id
  private_ip_google_access = true
}

resource "google_service_account" "workload_identity" {
  account_id   = "volition-api-runner"
  display_name = "Volition Cloud Run Workload Identity"
}

resource "google_secret_manager_secret" "database_dsn" {
  secret_id = "volition-prod-database-dsn"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_iam_member" "workload_secret_access" {
  secret_id = google_secret_manager_secret.database_dsn.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:\${google_service_account.workload_identity.email}"
}

resource "google_cloud_run_v2_service" "api" {
  name     = "volition-core-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.workload_identity.email

    scaling {
      min_instance_count = 1
      max_instance_count = 25
    }

    vpc_access {
      network_interfaces {
        network    = google_compute_network.serverless_vpc.name
        subnetwork = google_compute_subnetwork.run_egress.name
      }
      egress = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = var.container_image

      resources {
        limits = {
          cpu    = "2"
          memory = "1Gi"
        }
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_dsn.secret_id
            version = "latest"
          }
        }
      }
    }
  }
}

output "service_uri" {
  value = google_cloud_run_v2_service.api.uri
}`,
  },
];
