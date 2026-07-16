import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api", limiter);

const FlashcardSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const QuizOptionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
});

const StudyMaterialSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  flashcards: z.array(FlashcardSchema).min(1),
  quiz: z.array(QuizOptionSchema).min(1),
});

const GenerateRequestSchema = z.object({
  notes: z.string().min(10).max(10000),
});

const SYSTEM_PROMPT = `You are a study assistant. Given the user's study notes, generate structured learning material.

You MUST return ONLY valid JSON matching this exact schema. No markdown, no code fences, no extra text:

{
  "title": "string – a concise title for the topic",
  "summary": "string – a 2-4 sentence summary of the key concepts",
  "flashcards": [
    { "question": "string", "answer": "string" }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string – must match one of the options exactly",
      "explanation": "string – explain why this answer is correct"
    }
  ]
}

Rules:
- Generate 5-10 flashcards that cover the most important concepts.
- Generate 5 quiz questions with exactly 4 options each.
- The correctAnswer field must exactly match one of the four options.
- Keep questions and answers clear and concise.
- Do NOT wrap the JSON in markdown code fences.
- Do NOT include any text before or after the JSON object.
- Return ONLY the raw JSON object.`;

const FREE_MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
];

app.post("/api/generate", async (req, res) => {
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { notes } = parsed.data;

  if (!process.env.OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    let response = null;
    let lastError = "";

    for (const model of FREE_MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.CLIENT_ORIGIN || "http://localhost:5173",
              "X-Title": "Study Assistant",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: notes },
              ],
              temperature: 0.7,
              max_tokens: 4096,
            }),
          });

          if (response.ok) break;
          lastError = `${model}: ${response.status}`;
          if (response.status === 429 && attempt < 2) {
            await new Promise((r) => setTimeout(r, 5000));
          }
        } catch (fetchErr) {
          lastError = `Network: ${fetchErr.message}`;
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
      if (response && response.ok) break;
    }

    if (!response || !response.ok) {
      console.error("All models failed:", lastError);
      return res.status(502).json({
        error: "AI provider is busy. Please wait a minute and try again.",
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return res.status(502).json({ error: "AI returned an empty response." });
    }

    let cleaned = rawContent.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let material;
    try {
      material = JSON.parse(cleaned);
    } catch {
      console.error("Malformed JSON from LLM:", cleaned.slice(0, 200));
      return res.status(422).json({ error: "AI returned invalid structured data." });
    }

    const validated = StudyMaterialSchema.safeParse(material);
    if (!validated.success) {
      console.error("Schema validation failed:", validated.error.flatten());
      return res.status(422).json({ error: "AI returned invalid structured data." });
    }

    return res.json(validated.data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
