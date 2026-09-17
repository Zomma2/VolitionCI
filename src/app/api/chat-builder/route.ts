import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GEMINI_MODEL = "models/gemini-3.6-flash";
const GROQ_MODEL = "openai/gpt-oss-20b";

function extractFirstJsonObject(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    // Continue to balanced brace extraction
  }

  const start = raw.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (c === "{") {
        depth++;
      } else if (c === "}") {
        depth--;
        if (depth === 0) {
          const candidate = raw.substring(start, i + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { history, currentConfig, revision } = await req.json();
    const isFirstTurn = revision === 0;

    const systemPrompt = `You are a senior DevOps and Cloud Infrastructure Architect acting as a consultative expert.
The user is configuring an infrastructure generation workflow. You must extract: an 'archetype' (pipeline, terraform, kubernetes, docker), a 'targetPlatform' (e.g. GitHub Actions, AWS, Azure, Generic Kubernetes, GitLab CI), a 'repoUrl' if mentioned, and a list of 'technologies'.

${isFirstTurn ? `IMPORTANT -- FIRST INTERACTION PROTOCOL:
This is the user's FIRST message. You must act as a consultative expert:
1. Acknowledge what the user has described and confirm what you understood.
2. Provide an initial draft config based on what you can confidently extract.
3. Critically evaluate their input for ambiguities, missing requirements, or common pitfalls.
4. At the END of your reply, ask exactly 1 to 2 targeted follow-up questions designed to extract specific, actionable information. Frame them as an expert would -- e.g., "Do you need a staging environment separate from production?" or "Should we include database migration steps in the pipeline?" or "Which AWS region and availability zone strategy do you prefer?"
5. Also recommend 2 to 4 helpful tools with reasons.
Do NOT ask generic questions. Each question must address a concrete gap in their specification that would change the generated output.` : `IMPORTANT -- REFINEMENT PROTOCOL:
This is a follow-up revision. The user is answering your previous questions or making changes.
1. Incorporate their answers into the configuration.
2. Finalize the config with high confidence.
3. In your reply, summarize the final configuration clearly so they can review it before proceeding.
4. Do NOT ask further questions. Be conclusive.
5. Update recommendations based on the refined context.`}

Also, recommend helpful related tools and provide a slug from SimpleIcons (e.g., "sentry", "docker") and a hex color code without the hash (e.g., "362D59").

Output MUST be a JSON object with this exact schema (do not use markdown formatting):
{
  "reply": "Your conversational response including follow-up questions on first turn",
  "config": {
    "archetype": "pipeline" | "terraform" | "kubernetes" | "docker",
    "targetPlatform": "string",
    "repoUrl": "string | null",
    "technologies": ["tech1", "tech2"],
    "recommendations": [
      { "name": "Tool Name", "slug": "simple-icons-slug", "color": "HEX", "reason": "Why you recommend it" }
    ]
  }
}

Current Config Context (if any):
${JSON.stringify(currentConfig)}

Analyze the entire conversation history and extract/update the configuration fields based on what the user wants. Always output valid JSON. Do not use emojis anywhere in your output.`;

    const userMessages = history.map((h: any) => `${h.role}: ${h.content}`).join("\n");
    let parsed: any;

    try {
      const model = genAI.getGenerativeModel({ 
        model: GEMINI_MODEL,
        systemInstruction: systemPrompt 
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userMessages }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.3, responseMimeType: "application/json" }
      });
      const rawText = result.response.text();
      parsed = extractFirstJsonObject(rawText);
      if (!parsed) {
        throw new Error("Failed to parse JSON from Gemini response");
      }
    } catch (geminiErr: any) {
      console.warn("Gemini failed in chat-builder, falling back to Groq:", geminiErr?.message);
      
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessages }
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      });
      
      const rawContent = completion.choices[0]?.message?.content || "{}";
      parsed = extractFirstJsonObject(rawContent) || {};
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Chat builder error:", error);
    return NextResponse.json({ reply: "I encountered an error analyzing your request.", config: null }, { status: 500 });
  }
}
