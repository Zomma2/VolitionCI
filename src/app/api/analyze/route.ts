import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import Groq from "groq-sdk";
import { 
  DEVSECOPS_INTERROGATION_SYSTEM_PROMPT, 
  DEVSECOPS_INTERROGATION_USER_PROMPT 
} from "@/lib/prompts/devsecopsPrompts";
import {
  TERRAFORM_INTERROGATION_SYSTEM_PROMPT,
  TERRAFORM_INTERROGATION_USER_PROMPT,
  KUBERNETES_INTERROGATION_SYSTEM_PROMPT,
  KUBERNETES_INTERROGATION_USER_PROMPT,
} from "@/lib/prompts/iacPrompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

export async function POST(req: NextRequest) {
  try {
    const { repoUrl, manualStack, archetype = "pipeline", targetPlatform = "GitHub Actions" } = await req.json();

    if (!repoUrl && (!manualStack || manualStack.length === 0)) {
      return NextResponse.json({ error: "Missing repoUrl or manual stack" }, { status: 400 });
    }

    let repoContext = "";

    if (repoUrl) {
      // Parse github url (e.g. https://github.com/owner/repo)
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
      }

      const owner = match[1];
      const repo = match[2].replace(".git", "");

      // Fetch repository default branch
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const defaultBranch = repoData.default_branch;

      // Fetch tree
      const { data: treeData } = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: "true",
      });

      // Extract paths and construct a context
      const allPaths = treeData.tree.map((t) => t.path || "").filter(Boolean);
      const keyPaths = allPaths.filter(p => 
        p.includes("package.json") || 
        p.includes("Dockerfile") || 
        p.includes(".github/workflows") ||
        p.includes("pom.xml") ||
        p.includes("build.gradle") ||
        p.includes("go.mod") ||
        p.includes("requirements.txt") ||
        p.includes("Cargo.toml") ||
        p.includes(".tf") ||
        p.includes("k8s") ||
        p.includes("helm")
      );

      const samplePaths = allPaths.slice(0, 100); 

      repoContext = `
Repository: ${owner}/${repo}
Default Branch: ${defaultBranch}
Description: ${repoData.description || "N/A"}

Sample Directory Structure:
${samplePaths.join("\n")}

Key Discovered Files (Build/CI/Containers/IaC):
${keyPaths.join("\n")}
      `.trim();
    } else {
      repoContext = `
User elected manual configuration.
Target Archetype: ${archetype}
Target Platform: ${targetPlatform}
Manually Selected Tech Stack:
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
    }

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1500,
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseContent);

    return NextResponse.json({
      repoContext,
      detectedStack: parsed.detectedStack,
      questions: parsed.questions,
    });

  } catch (err: any) {
    console.error("[/api/analyze] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
