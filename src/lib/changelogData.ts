export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  tag: "Latest Release" | "Major Architecture" | "Platform" | "Foundation";
  summary: string;
  changes: {
    category: "Architecture" | "AI Routing" | "Security" | "Studio UX" | "Infrastructure" | "Platform";
    description: string;
  }[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "v0.4.2",
    date: "November 2026",
    title: "Production Platform Suite, Blueprints Library & Local Run History",
    tag: "Latest Release",
    summary:
      "Expanded VolitionCI from a standalone wizard into a complete DevSecOps synthesis platform with full technical documentation, verified blueprint templates, inline Monaco editing, and persistent local run history.",
    changes: [
      {
        category: "Studio UX",
        description:
          "Added interactive 4-stage pipeline progress header, persistent local synthesis history drawer, editable Monaco output mode, and 1-click default answer selection during interrogation.",
      },
      {
        category: "Platform",
        description:
          "Launched the Blueprints Library (/examples) with 6 production-grade YAML and HCL templates supporting direct Monaco inspection and 1-click Studio customization.",
      },
      {
        category: "Studio UX",
        description:
          "Published full architecture and API reference documentation (/docs) alongside structured release notes (/changelog) and card-first target platform selectors.",
      },
      {
        category: "Infrastructure",
        description:
          "Hardened Vercel serverless execution with 60s function budgets, unbuffered SSE streaming headers (X-Accel-Buffering: no), and request-scoped SDK initialization.",
      },
    ],
  },
  {
    version: "v0.4.0",
    date: "September 2026",
    title: "Consultative AI Builder & Multi-Provider Failover Chains",
    tag: "Major Architecture",
    summary:
      "Introduced the two-phase consultative AI Architect mode and replaced dual-model fallback with deterministic 3-tier provider chains across Gemini 3.6 Flash, Mistral Codestral, Cohere Command R+, and Groq.",
    changes: [
      {
        category: "AI Routing",
        description:
          "Upgraded primary Planner, Worker, and Semantic Validator chains to Gemini 3.6 Flash with automated failover to Codestral, Command R+, and Groq GPT-OSS 120B/20B.",
      },
      {
        category: "Studio UX",
        description:
          "Added Consultative AI Builder chat workflow: evaluates initial user specifications for architectural gaps, asks 1-2 targeted follow-up questions, and renders toggleable SimpleIcons tool recommendations.",
      },
      {
        category: "Security",
        description:
          "Implemented balanced-brace string-aware JSON extraction in /api/chat-builder to prevent parser failures when fallback models emit trailing commentary.",
      },
    ],
  },
  {
    version: "v0.3.0",
    date: "September 2026",
    title: "ReAct Planner-Worker Synthesis & Semantic Validation",
    tag: "Major Architecture",
    summary:
      "Re-engineered code synthesis from monolithic single-shot generation into an iterative ReAct Planner-Worker-Validator pipeline to eliminate token truncation on complex cloud topologies.",
    changes: [
      {
        category: "Architecture",
        description:
          "Added Phase 1 Infrastructure Planner that decomposes user stacks into 2-5 ordered modules (e.g., Provider Settings, Networking, IAM, Compute, Database).",
      },
      {
        category: "Architecture",
        description:
          "Built context-chaining Worker loop where each synthesized module inherits prior resource identifiers and passes incremental YAML/HCL linting before advancing.",
      },
      {
        category: "Security",
        description:
          "Added Phase 3 LLM Semantic Validator to verify every user-requested service and security control is explicitly declared in the final assembled output.",
      },
      {
        category: "Studio UX",
        description:
          "Added real-time per-module SSE progress events and granular prompt/completion token telemetry table below the Monaco editor.",
      },
    ],
  },
  {
    version: "v0.2.0",
    date: "September 2026",
    title: "Multi-Archetype Expansion: Terraform, Kubernetes & Docker Compose",
    tag: "Platform",
    summary:
      "Extended VolitionCI beyond CI/CD pipelines to support multi-cloud Terraform HCL, Kubernetes cluster manifests, and multi-container Docker Compose specifications.",
    changes: [
      {
        category: "Architecture",
        description:
          "Added custom structural HCL validator checking string-escaped brace balance and root Terraform block declarations alongside multi-document js-yaml validation.",
      },
      {
        category: "Studio UX",
        description:
          "Introduced Manual Stack Composer with curated technology cards for AWS, Azure, GCP, DigitalOcean, EKS/GKE/AKS, and polyglot container stacks.",
      },
    ],
  },
  {
    version: "v0.1.0",
    date: "September 2026",
    title: "Initial Autonomous DevSecOps Pipeline Engine",
    tag: "Foundation",
    summary:
      "Initial release featuring Octokit recursive GitHub tree scanning, dynamic architectural interrogation, and self-healing YAML pipeline generation.",
    changes: [
      {
        category: "Architecture",
        description:
          "Implemented /api/analyze with GitHub repository tree inspection for automatic language, package manager, Dockerfile, and IaC manifest discovery.",
      },
      {
        category: "Security",
        description:
          "Built 3-attempt automated self-healing loop feeding parser diagnostics back to the synthesis model until valid configuration syntax is achieved.",
      },
    ],
  },
];
