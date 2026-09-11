import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Translation and Vocabulary Expansion API
app.post("/api/translate", async (req, res) => {
  try {
    const { text, context, dictionaryName } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Необходимо указать английское слово или фразу" });
      return;
    }

    const trimmedText = text.trim();
    const ai = getGeminiClient();

    const prompt = `Ты профессиональный лингвист и преподаватель английского языка.
Переведи и разбери следующее английское слово или фразу для создания идеальной карточки Anki для русскоязычного студента:
"${trimmedText}"
${context ? `Дополнительный контекст от пользователя: "${context}"` : ""}
${dictionaryName ? `Тематическая категория: "${dictionaryName}"` : ""}

Верни четкий структурированный JSON со следующими полями:
- original: исходное слово или фраза с правильной капитализацией (например "serendipity" или "figure out")
- translation: наиболее точный, естественный и распространенный перевод на русский язык
- alternatives: список из 2-4 альтернативных вариантов перевода или синонимов
- transcription: фонетическая транскрипция в IPA (например "/ˌserənˈdɪpəti/" или "/ˈpɜːrpəs/")
- partOfSpeech: часть речи на русском (например: "существительное", "глагол", "прилагательное", "фразовый глагол", "идиома")
- definition: краткое, емкое толкование значения на русском языке
- exampleEn: живое, современное примерное предложение на английском языке с этим словом/фразой
- exampleRu: качественный литературный перевод примерного предложения на русский язык
- mnemonic: полезная ассоциация или мнемонический совет для легкого запоминания (1 короткое предложение)
- tags: массив из 2-4 подходящих тегов на английском (например: ["intermediate", "business", "verbs"])`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            translation: { type: Type.STRING },
            alternatives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            transcription: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            definition: { type: Type.STRING },
            exampleEn: { type: Type.STRING },
            exampleRu: { type: Type.STRING },
            mnemonic: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "original",
            "translation",
            "transcription",
            "partOfSpeech",
            "exampleEn",
            "exampleRu",
          ],
        },
      },
    });

    const responseText = response.text || "{}";
    const parsed = JSON.parse(responseText);

    res.json({
      success: true,
      data: {
        original: parsed.original || trimmedText,
        translation: parsed.translation || "",
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
        transcription: parsed.transcription || "",
        partOfSpeech: parsed.partOfSpeech || "",
        definition: parsed.definition || "",
        exampleEn: parsed.exampleEn || "",
        exampleRu: parsed.exampleRu || "",
        mnemonic: parsed.mnemonic || "",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      },
    });
  } catch (error: any) {
    console.error("Translation API error:", error);
    res.status(500).json({
      error: "Не удалось получить перевод через ИИ",
      message: error?.message || "Неизвестная ошибка сервера",
    });
  }
});

// Proxy for AnkiConnect to solve potential browser mixed-content or CORS restrictions
app.post("/api/ankiconnect/proxy", async (req, res) => {
  try {
    const { endpoint = "http://127.0.0.1:8765", action, params = {}, version = 6 } = req.body;

    // Safety check: endpoint must be http/https
    if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
      res.status(400).json({ error: "Недопустимый URL для AnkiConnect" });
      return;
    }

    const ankiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, version, params }),
    });

    if (!ankiResponse.ok) {
      res.status(ankiResponse.status).json({
        error: `AnkiConnect вернул HTTP статус ${ankiResponse.status}`,
      });
      return;
    }

    const data = await ankiResponse.json();
    res.json(data);
  } catch (error: any) {
    console.warn("AnkiConnect proxy request error:", error.message);
    res.status(502).json({
      error: "Не удалось подключиться к AnkiConnect",
      message: error.message || "Anki не запущен или плагин AnkiConnect не отвечает",
    });
  }
});

// Vite middleware & Static fallback
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
