import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GEMINI_MODEL = "models/antigravity-preview-09-2026";
const GROQ_MODEL = "openai/gpt-oss-20b";

export async function POST(req: NextRequest) {
  try {
    const { history, currentConfig } = await req.json();

    const systemPrompt = `You are an AI Architect helping a user configure their infrastructure or CI/CD pipeline.
The user is selecting an 'archetype' (pipeline, terraform, kubernetes, docker), a 'targetPlatform' (e.g. GitHub Actions, AWS, Azure, Generic Kubernetes, Gitlab CI), a 'repoUrl' if mentioned, and a list of 'technologies'.
Also, recommend helpful related tools (e.g., if they mention Next.js, recommend Sentry or Docker) and provide a slug from SimpleIcons (e.g., "sentry", "docker") and a hex color code without the hash (e.g., "362D59").

Output MUST be a JSON object with this exact schema (do not use markdown formatting):
{
  "reply": "Your conversational response to the user",
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

Analyze the entire conversation history and extract/update the configuration fields based on what the user wants. Always output valid JSON.`;

    const userMessages = history.map((h: any) => `${h.role}: ${h.content}`).join("\n");
    let parsed: any;

    try {
      const model = genAI.getGenerativeModel({ 
        model: GEMINI_MODEL,
        systemInstruction: systemPrompt 
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userMessages }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.2, responseMimeType: "application/json" }
      });
      parsed = JSON.parse(result.response.text());
    } catch (geminiErr: any) {
      console.warn("Gemini failed in chat-builder, falling back to Groq:", geminiErr?.message);
      
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessages }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
      
      const rawContent = completion.choices[0]?.message?.content || "{}";
      const match = rawContent.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : "{}");
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Chat builder error:", error);
    return NextResponse.json({ reply: "I encountered an error analyzing your request.", config: null }, { status: 500 });
  }
}
