import { AnkiSettings, WordCard } from "../types";

export interface AnkiResponse<T = any> {
  result: T;
  error: string | null;
}

/**
 * Execute an AnkiConnect action.
 * First tries direct browser fetch to the specified URL (usually http://127.0.0.1:8765).
 * If direct fetch fails (due to mixed content or CORS) and useProxy is enabled, falls back to server-side proxy /api/ankiconnect/proxy.
 */
export async function invokeAnkiConnect<T = any>(
  settings: AnkiSettings,
  action: string,
  params: Record<string, any> = {}
): Promise<T> {
  const payload = {
    action,
    version: 6,
    params,
  };

  // 1. Try direct client-side fetch first if not forced to proxy
  if (!settings.useProxy) {
    try {
      const response = await fetch(settings.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: AnkiResponse<T> = await response.json();
        if (data.error) {
          throw new Error(`AnkiConnect ошибка: ${data.error}`);
        }
        return data.result;
      }
    } catch (directErr: any) {
      console.warn("Прямое подключение к AnkiConnect не удалось, пробуем прокси:", directErr.message);
      // Fall through to try server proxy
    }
  }

  // 2. Try server-side proxy
  try {
    const proxyResponse = await fetch("/api/ankiconnect/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: settings.url,
        action,
        params,
        version: 6,
      }),
    });

    if (!proxyResponse.ok) {
      const errData = await proxyResponse.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || `HTTP ${proxyResponse.status}`);
    }

    const data: AnkiResponse<T> = await proxyResponse.json();
    if (data.error) {
      throw new Error(`AnkiConnect: ${data.error}`);
    }
    return data.result;
  } catch (proxyErr: any) {
    throw new Error(
      `Не удалось связаться с AnkiConnect: убедитесь, что приложение Anki запущено на компьютере и плагин AnkiConnect установлен. (Детали: ${proxyErr.message})`
    );
  }
}

/**
 * Test connection to AnkiConnect and return version
 */
export async function testAnkiConnection(settings: AnkiSettings): Promise<{ connected: boolean; version?: number; error?: string }> {
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
  try {
    await invokeAnkiConnect(settings, "createDeck", { deck: deckName });
    return true;
  } catch (err) {
    console.warn("Could not create deck:", err);
    return false;
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
  const alternativesHtml = card.alternatives && card.alternatives.length > 0
    ? `<div style="font-size: 14px; color: #64748b; margin-top: 6px;">Синонимы / варианты: <span style="color: #334155;">${card.alternatives.map(escapeHtml).join(", ")}</span></div>`
    : "";

  const definitionHtml = card.definition
    ? `<div style="font-size: 14px; color: #475569; margin-top: 10px; background-color: #f8fafc; padding: 8px 12px; border-radius: 8px; border-left: 3px solid #6366f1; text-align: left;">${escapeHtml(card.definition)}</div>`
    : "";

  const exampleHtml = card.exampleEn
    ? `<div style="margin-top: 14px; padding: 12px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; text-align: left;">
        <div style="font-size: 15px; color: #166534; font-weight: 500;">${escapeHtml(card.exampleEn)}</div>
        ${card.exampleRu ? `<div style="font-size: 13px; color: #4ade80; color: #15803d; margin-top: 4px;">${escapeHtml(card.exampleRu)}</div>` : ""}
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
  // Ensure deck exists
  if (settings.autoCreateDeck) {
    await ensureDeckExists(settings, settings.deckName);
  }

  const frontContent = formatCardFrontHtml(card);
  const backContent = formatCardBackHtml(card, dictionaryName);

  const tags = [
    "anki-cards-creator",
    ...(dictionaryName ? [dictionaryName.toLowerCase().replace(/\s+/g, "_")] : []),
    ...(card.tags || []),
  ];

  const notePayload = {
    note: {
      deckName: settings.deckName,
      modelName: settings.modelName || "Basic",
      fields: {
        [settings.frontField || "Front"]: frontContent,
        [settings.backField || "Back"]: backContent,
      },
      options: {
        allowDuplicate: false,
        duplicateScope: "deck",
      },
      tags,
    },
  };

  const noteId = await invokeAnkiConnect<number>(settings, "addNote", notePayload);
  return { noteId };
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
