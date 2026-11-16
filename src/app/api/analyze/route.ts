import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import {
  DEVSECOPS_INTERROGATION_SYSTEM_PROMPT,
  DEVSECOPS_INTERROGATION_USER_PROMPT,
} from "@/lib/prompts/devsecopsPrompts";
import {
  TERRAFORM_INTERROGATION_SYSTEM_PROMPT,
  TERRAFORM_INTERROGATION_USER_PROMPT,
  KUBERNETES_INTERROGATION_SYSTEM_PROMPT,
  KUBERNETES_INTERROGATION_USER_PROMPT,
} from "@/lib/prompts/iacPrompts";
import {
  DOCKER_INTERROGATION_SYSTEM_PROMPT,
  DOCKER_INTERROGATION_USER_PROMPT,
} from "@/lib/prompts/dockerPrompts";
import {
  buildModelChain,
  executeModelChain,
  extractFirstJsonObject,
} from "@/lib/serverModelRouter";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });
    const {
      repoUrl,
      manualStack,
      archetype = "pipeline",
      targetPlatform = "GitHub Actions",
      selectedModel = "multi-agent",
    } = await req.json();

    if (!repoUrl && (!manualStack || manualStack.length === 0)) {
      return NextResponse.json({ error: "Missing repoUrl or manual stack" }, { status: 400 });
    }

    let repoContext = "";

    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/?#]+)/);
      if (!match) {
        return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
      }

      const owner = match[1];
      const repo = match[2].replace(/\.git$/, "");

      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const defaultBranch = repoData.default_branch;

      const { data: treeData } = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: "true",
      });

      const allPaths = treeData.tree.map((t) => t.path || "").filter(Boolean);
      const keyPaths = allPaths.filter(
        (p) =>
          p.includes("package.json") ||
          p.includes("Dockerfile") ||
          p.includes(".github/workflows") ||
          p.includes("pom.xml") ||
          p.includes("build.gradle") ||
          p.includes("go.mod") ||
          p.includes("requirements.txt") ||
          p.includes("pyproject.toml") ||
          p.includes("Cargo.toml") ||
          p.includes(".tf") ||
          p.includes("k8s") ||
          p.includes("helm")
      );

      const samplePaths = allPaths.slice(0, 120);

      repoContext = `
Repository: ${owner}/${repo}
Default Branch: ${defaultBranch}
Target Archetype: ${archetype}
Target Platform: ${targetPlatform}
Description: ${repoData.description || "N/A"}
${manualStack && manualStack.length > 0 ? `Selected Tooling & Stack: ${manualStack.join(", ")}\n` : ""}
Sample Directory Structure:
${samplePaths.join("\n")}

Key Discovered Files (Build/CI/Containers/IaC):
${keyPaths.join("\n")}
      `.trim();
    } else {
      repoContext = `
User elected custom stack specification.
Target Archetype: ${archetype}
Target Platform: ${targetPlatform}
Selected Tech Stack & Tooling:
${manualStack.join(", ")}
      `.trim();
    }

    let systemPrompt = DEVSECOPS_INTERROGATION_SYSTEM_PROMPT;
    let userPrompt = DEVSECOPS_INTERROGATION_USER_PROMPT(repoContext);

    if (archetype === "terraform") {
      systemPrompt = TERRAFORM_INTERROGATION_SYSTEM_PROMPT;
      userPrompt = TERRAFORM_INTERROGATION_USER_PROMPT(repoContext, targetPlatform);
    } else if (archetype === "kubernetes") {
      systemPrompt = KUBERNETES_INTERROGATION_SYSTEM_PROMPT;
      userPrompt = KUBERNETES_INTERROGATION_USER_PROMPT(repoContext, targetPlatform);
    } else if (archetype === "docker") {
      systemPrompt = DOCKER_INTERROGATION_SYSTEM_PROMPT;
      userPrompt = DOCKER_INTERROGATION_USER_PROMPT(repoContext, targetPlatform);
    }

    const { content, usedSpec } = await executeModelChain({
      roleLabel: "Stack Analyzer",
      systemPrompt,
      userPrompt,
      maxTokens: 4096,
      temperature: 0.2,
      jsonMode: true,
      minChars: 30,
      chain: buildModelChain(selectedModel, "analyze"),
    });

    const parsed = extractFirstJsonObject(content) || {};

    return NextResponse.json({
      repoContext,
      detectedStack: parsed.detectedStack || {
        languages: manualStack || [],
        packageManagers: [],
        hasDockerfile: true,
      },
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      modelUsed: usedSpec.label,
    });
  } catch (err: any) {
    console.error("[/api/analyze] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
