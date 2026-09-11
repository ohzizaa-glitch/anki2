import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI, Type } from "@google/genai";

interface VercelRequest extends IncomingMessage {
  body: any;
  query: { [key: string]: string | string[] };
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text, context, dictionaryName } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Необходимо указать английское слово или фразу" });
      return;
    }

    const trimmedText = text.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(500).json({ error: "GEMINI_API_KEY is not configured on Vercel" });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `Ты профессиональный лингвист и преподаватель английского языка.
Переведи и разбери следующее английское слово или фразу для создания идеальной карточки Anki для русскоязычного студента:
"${trimmedText}"
${context ? `Дополнительный контекст от пользователя: "${context}"` : ""}
${dictionaryName ? `Тематическая категория: "${dictionaryName}"` : ""}

Верни четкий структурированный JSON со следующими полями:
- original: исходное слово или фраза
- translation: наиболее точный, естественный перевод на русский язык
- alternatives: 2-4 альтернативных вариантов перевода
- transcription: фонетическая транскрипция IPA
- partOfSpeech: часть речи на русском
- definition: краткое толкование значения на русском
- exampleEn: живое примерное предложение на английском
- exampleRu: русский перевод предложения
- mnemonic: мнемоника или ассоциация для запоминания
- tags: массив из 2-4 тегов`;

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

    res.status(200).json({
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
    res.status(500).json({
      error: "Ошибка генерации перевода",
      message: error?.message || "Internal server error",
    });
  }
}
