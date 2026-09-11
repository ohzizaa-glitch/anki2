import { AnkiSettings, WordCard } from "../types";

export interface AnkiResponse<T = any> {
  result: T;
  error: string | null;
}

// In-memory cache for auto-detected model & field names to avoid extra roundtrips
let cachedModelInfo: {
  modelName: string;
  frontField: string;
  backField: string;
} | null = null;

/**
 * Reset detected model cache (e.g. after settings change or error)
 */
export function resetAnkiModelCache(): void {
  cachedModelInfo = null;
}

/**
 * Execute an AnkiConnect action.
 * Directly sends JSON-RPC to user's local AnkiConnect (http://127.0.0.1:8765).
 * Accurately surfaces Anki errors without masking them behind a proxy 404.
 */
export async function invokeAnkiConnect<T = any>(
  settings: AnkiSettings,
  action: string,
  params: Record<string, any> = {}
): Promise<T> {
  const ankiUrl = (settings.url || "http://127.0.0.1:8765").trim();
  const payload = {
    action,
    version: 6,
    params,
  };

  let directNetworkError: any = null;

  // 1. Direct browser fetch to AnkiConnect
  try {
    const response = await fetch(ankiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data: AnkiResponse<T> = await response.json();
      if (data.error) {
        // This is a business error from AnkiConnect itself (e.g. "model was not found", "deck was not found")
        // NEVER fall back to proxy when AnkiConnect responded! Throw the real error.
        throw new Error(data.error);
      }
      return data.result;
    } else {
      throw new Error(`AnkiConnect HTTP ${response.status}`);
    }
  } catch (err: any) {
    directNetworkError = err;

    // If this error came from data.error (AnkiConnect error message), rethrow immediately!
    const msg = err.message || "";
    const isNetworkGlitch =
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("Load failed") ||
      msg.includes("Failed to load");

    if (!isNetworkGlitch) {
      // It's a real Anki error or HTTP error from Anki
      throw err;
    }
  }

  // 2. Only attempt server proxy if running locally on localhost/127.0.0.1
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (settings.useProxy && isLocalHost) {
    try {
      const proxyResponse = await fetch("/api/ankiconnect/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: ankiUrl,
          action,
          params,
          version: 6,
        }),
      });

      if (proxyResponse.ok) {
        const data: AnkiResponse<T> = await proxyResponse.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return data.result;
      }
    } catch (proxyErr: any) {
      console.warn("Proxy fallback failed:", proxyErr);
    }
  }

  // 3. User-friendly explanation for Vercel / HTTPS deployments
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  if (isHttps) {
    throw new Error(
      `Браузер заблокировал запрос с HTTPS сайта на локальный Anki (Mixed Content). ` +
      `В адресной строке браузера нажмите на значок настроек сайта → «Настройки сайтов» → «Небезопасный контент: Разрешить», ` +
      `либо используйте экспорт в файл Anki (.txt).`
    );
  }

  throw new Error(
    directNetworkError?.message ||
      "Не удалось связаться с AnkiConnect: убедитесь, что приложение Anki запущено и дополнение AnkiConnect активно на порту 8765."
  );
}

/**
 * Test connection to AnkiConnect and return version
 */
export async function testAnkiConnection(
  settings: AnkiSettings
): Promise<{ connected: boolean; version?: number; error?: string }> {
  try {
    const version = await invokeAnkiConnect<number>(settings, "version");
    return { connected: true, version };
  } catch (err: any) {
    return { connected: false, error: err.message || "Ошибка подключения" };
  }
}

/**
 * Fetch all deck names from Anki
 */
export async function getAnkiDecks(settings: AnkiSettings): Promise<string[]> {
  try {
    const decks = await invokeAnkiConnect<string[]>(settings, "deckNames");
    return decks || [];
  } catch (err) {
    console.error("Failed to fetch Anki decks:", err);
    return [];
  }
}

/**
 * Fetch all note models (card types) from Anki
 */
export async function getAnkiModels(settings: AnkiSettings): Promise<string[]> {
  try {
    const models = await invokeAnkiConnect<string[]>(settings, "modelNames");
    return models || [];
  } catch (err) {
    console.error("Failed to fetch Anki models:", err);
    return [];
  }
}

/**
 * Ensure a deck exists, creating it if needed
 */
export async function ensureDeckExists(settings: AnkiSettings, deckName: string): Promise<boolean> {
  if (!deckName) return false;
  try {
    await invokeAnkiConnect(settings, "createDeck", { deck: deckName });
    return true;
  } catch (err) {
    console.warn("Deck creation warning (may already exist):", err);
    return false;
  }
}

/**
 * Check if a model is a Cloze (Fill-in-the-blank) type.
 * Cloze models require {{c1::...}} markers and will fail with "Задание с пропусками 1 не найдено"
 * if used for standard front/back vocabulary cards.
 */
export function isClozeModel(name: string): boolean {
  if (!name) return false;
  const s = name.trim().toLowerCase();
  return (
    s.includes("пропуск") ||
    s.includes("cloze") ||
    s.includes("lücke") ||
    s.includes("texte à trous")
  );
}

/**
 * Automatically detects the best available Anki Note Model and Field Names.
 * Seamlessly handles English Anki ("Basic" -> "Front", "Back")
 * and Russian Anki ("Основная" -> "Лицевая сторона", "Оборотная сторона").
 * Strictly avoids Cloze models ("Задание с пропусками") for standard word-translation cards.
 */
export async function detectAnkiModelAndFields(settings: AnkiSettings): Promise<{
  modelName: string;
  frontField: string;
  backField: string;
}> {
  if (cachedModelInfo) {
    return cachedModelInfo;
  }

  try {
    const models = await invokeAnkiConnect<string[]>(settings, "modelNames");
    if (!models || models.length === 0) {
      return {
        modelName: settings.modelName || "Basic",
        frontField: settings.frontField || "Front",
        backField: settings.backField || "Back",
      };
    }

    // Filter out Cloze models ("Задание с пропусками") because vocabulary cards have front and back
    const nonClozeModels = models.filter((m) => !isClozeModel(m));
    const candidatePool = nonClozeModels.length > 0 ? nonClozeModels : models;

    // 1. Check if user-specified model exists and is NOT cloze
    let chosenModel: string | undefined;
    if (settings.modelName && !isClozeModel(settings.modelName)) {
      chosenModel = candidatePool.find((m) => m === settings.modelName);
    }

    // 2. If not found or user had a Cloze model configured, find standard Russian or English basic model
    if (!chosenModel) {
      chosenModel =
        candidatePool.find((m) => m === "Основная") ||
        candidatePool.find((m) => m.toLowerCase() === "basic") ||
        candidatePool.find((m) => m.startsWith("Основная")) ||
        candidatePool.find((m) => m.toLowerCase().startsWith("basic")) ||
        candidatePool.find((m) => m.toLowerCase().includes("основн")) ||
        candidatePool.find((m) => m.toLowerCase().includes("basic")) ||
        candidatePool[0];
    }

    // 3. Query field names for the selected model
    const fields = await invokeAnkiConnect<string[]>(settings, "modelFieldNames", {
      modelName: chosenModel,
    });

    let front = settings.frontField || "Front";
    let back = settings.backField || "Back";

    if (fields && fields.length >= 2) {
      // Find suitable front field
      const frontCandidates = [
        "лицевая сторона",
        "лицевая",
        "front",
        "вопрос",
        "question",
        "слово",
        "word",
        "term",
        "text",
        "front text",
      ];
      const matchedFront = fields.find((f) =>
        frontCandidates.some((c) => c.toLowerCase() === f.toLowerCase())
      );
      front = matchedFront || fields[0];

      // Find suitable back field
      const backCandidates = [
        "оборотная сторона",
        "оборотная",
        "back",
        "ответ",
        "answer",
        "перевод",
        "translation",
        "meaning",
        "extra",
        "back text",
      ];
      const matchedBack = fields.find(
        (f) => f !== front && backCandidates.some((c) => c.toLowerCase() === f.toLowerCase())
      );
      back = matchedBack || fields[1];
    } else if (fields && fields.length === 1) {
      front = fields[0];
      back = fields[0];
    }

    cachedModelInfo = {
      modelName: chosenModel,
      frontField: front,
      backField: back,
    };
    return cachedModelInfo;
  } catch (err) {
    console.warn("Could not auto-detect Anki model/fields, falling back:", err);
    return {
      modelName: settings.modelName && !isClozeModel(settings.modelName) ? settings.modelName : "Basic",
      frontField: settings.frontField || "Front",
      backField: settings.backField || "Back",
    };
  }
}

/**
 * Format rich HTML for Front and Back fields
 */
export function formatCardFrontHtml(card: WordCard): string {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 20px;">
  <div style="font-size: 28px; font-weight: 700; color: #2563eb; letter-spacing: -0.02em;">${escapeHtml(card.original)}</div>
  ${card.transcription ? `<div style="font-size: 18px; color: #64748b; margin-top: 6px; font-style: italic;">${escapeHtml(card.transcription)}</div>` : ""}
  ${card.partOfSpeech ? `<div style="display: inline-block; font-size: 13px; color: #475569; background-color: #f1f5f9; padding: 3px 10px; border-radius: 9999px; margin-top: 10px; border: 1px solid #e2e8f0;">${escapeHtml(card.partOfSpeech)}</div>` : ""}
</div>`.trim();
}

export function formatCardBackHtml(card: WordCard, dictionaryName?: string): string {
  const alternativesHtml =
    card.alternatives && card.alternatives.length > 0
      ? `<div style="font-size: 14px; color: #64748b; margin-top: 6px;">Синонимы / варианты: <span style="color: #334155;">${card.alternatives.map(escapeHtml).join(", ")}</span></div>`
      : "";

  const definitionHtml = card.definition
    ? `<div style="font-size: 14px; color: #475569; margin-top: 10px; background-color: #f8fafc; padding: 8px 12px; border-radius: 8px; border-left: 3px solid #6366f1; text-align: left;">${escapeHtml(card.definition)}</div>`
    : "";

  const exampleHtml = card.exampleEn
    ? `<div style="margin-top: 14px; padding: 12px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; text-align: left;">
        <div style="font-size: 15px; color: #166534; font-weight: 500;">${escapeHtml(card.exampleEn)}</div>
        ${card.exampleRu ? `<div style="font-size: 13px; color: #15803d; margin-top: 4px;">${escapeHtml(card.exampleRu)}</div>` : ""}
      </div>`
    : "";

  const mnemonicHtml = card.mnemonic
    ? `<div style="margin-top: 10px; padding: 8px 12px; background-color: #fefce8; border-radius: 8px; border: 1px solid #fef08a; font-size: 13px; color: #854d0e; text-align: left;">
        💡 <strong>Мнемоника:</strong> ${escapeHtml(card.mnemonic)}
      </div>`
    : "";

  const footerHtml = dictionaryName
    ? `<div style="margin-top: 12px; font-size: 12px; color: #94a3b8; text-align: right;">Словарь: ${escapeHtml(dictionaryName)}</div>`
    : "";

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 10px 20px;">
  <div style="font-size: 24px; font-weight: 700; color: #059669; letter-spacing: -0.01em;">${escapeHtml(card.translation)}</div>
  ${alternativesHtml}
  ${definitionHtml}
  ${exampleHtml}
  ${mnemonicHtml}
  ${footerHtml}
</div>`.trim();
}

/**
 * Add a note to Anki via AnkiConnect
 */
export async function addCardToAnki(
  settings: AnkiSettings,
  card: WordCard,
  dictionaryName?: string
): Promise<{ noteId: number }> {
  // Target deck: user-selected dictionary name, or configured default
  const targetDeck = (dictionaryName && dictionaryName.trim()) || settings.deckName || "Общий словарь";

  // Ensure target deck exists in Anki
  if (settings.autoCreateDeck !== false) {
    await ensureDeckExists(settings, targetDeck);
  }

  // Resolve model and field names dynamically
  const { modelName, frontField, backField } = await detectAnkiModelAndFields(settings);

  const frontContent = formatCardFrontHtml(card);
  const backContent = formatCardBackHtml(card, dictionaryName);

  const tags = [
    "anki-cards-creator",
    ...(dictionaryName ? [dictionaryName.toLowerCase().replace(/\s+/g, "_")] : []),
    ...(card.tags || []),
  ];

  // Populate fields
  const fieldsPayload: Record<string, string> = {};
  if (frontField === backField) {
    fieldsPayload[frontField] = `${frontContent}<hr style="border:0;border-top:1px dashed #cbd5e1;margin:16px 0;">${backContent}`;
  } else {
    fieldsPayload[frontField] = frontContent;
    fieldsPayload[backField] = backContent;
  }

  const notePayload = {
    note: {
      deckName: targetDeck,
      modelName,
      fields: fieldsPayload,
      options: {
        allowDuplicate: true, // Allow saving even if term was previously added
        duplicateScope: "deck",
      },
      tags,
    },
  };

  try {
    const noteId = await invokeAnkiConnect<number>(settings, "addNote", notePayload);
    return { noteId };
  } catch (addErr: any) {
    // If it failed because of cached model or fields, invalidate cache for future calls
    cachedModelInfo = null;
    throw addErr;
  }
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
