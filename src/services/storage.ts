import { AnkiSettings, Dictionary, WordCard } from "../types";
import { formatCardFrontHtml, formatCardBackHtml } from "./ankiConnect";

const ANKI_GUID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~";

export function generateAnkiGuid(): string {
  let guid = "";
  for (let i = 0; i < 10; i++) {
    const idx = Math.floor(Math.random() * ANKI_GUID_CHARS.length);
    guid += ANKI_GUID_CHARS[idx];
  }
  return guid;
}

const STORAGE_KEYS = {
  WORDS: "anki_app_words_v1",
  DICTIONARIES: "anki_app_dictionaries_v1",
  SETTINGS: "anki_app_settings_v1",
  THEME: "anki_app_theme_v1",
};

export const DEFAULT_DICTIONARIES: Dictionary[] = [
  {
    id: "dict_general",
    name: "Общий словарь",
    description: "Универсальные слова для повседневного словарного запаса",
    icon: "BookOpen",
    color: "indigo",
    isDefault: true,
    createdAt: 1700000000000,
  },
  {
    id: "dict_it",
    name: "IT & Разработка",
    description: "Термины программирования, архитектуры и технологий",
    icon: "Code",
    color: "emerald",
    isDefault: false,
    createdAt: 1700000001000,
  },
  {
    id: "dict_travel",
    name: "Путешествия & Аэропорт",
    description: "Навигация за рубежом, отели, билеты и рестораны",
    icon: "Plane",
    color: "sky",
    isDefault: false,
    createdAt: 1700000002000,
  },
  {
    id: "dict_business",
    name: "Бизнес & Переговоры",
    description: "Деловая переписка, встречи и профессиональное общение",
    icon: "Briefcase",
    color: "amber",
    isDefault: false,
    createdAt: 1700000003000,
  },
  {
    id: "dict_idioms",
    name: "Идиомы & Фразовые глаголы",
    description: "Яркие выражения, сленг и естественная разговорная речь",
    icon: "Sparkles",
    color: "purple",
    isDefault: false,
    createdAt: 1700000004000,
  },
  {
    id: "dict_daily",
    name: "Повседневная жизнь",
    description: "Быт, хобби, покупки, эмоции и привычки",
    icon: "Coffee",
    color: "rose",
    isDefault: false,
    createdAt: 1700000005000,
  },
];

export const DEFAULT_ANKI_SETTINGS: AnkiSettings = {
  url: "http://127.0.0.1:8765",
  deckName: "English::Vocabulary",
  modelName: "Basic",
  frontField: "Front",
  backField: "Back",
  autoCreateDeck: true,
  useProxy: false,
};

export const INITIAL_CARDS: WordCard[] = [
  {
    id: "card_1",
    original: "serendipity",
    translation: "счастливая случайность",
    alternatives: ["интуитивная прозорливость", "удачное стечение обстоятельств"],
    transcription: "/ˌserənˈdɪpəti/",
    partOfSpeech: "существительное",
    definition: "Способность случайно находить приятные или полезные вещи там, где их не искали.",
    exampleEn: "Finding my dream job while reading a travel blog was pure serendipity.",
    exampleRu: "То, что я нашел работу мечты, читая блог о путешествиях, было чистой счастливой случайностью.",
    mnemonic: "Вспомните 'Серендип' (старинное название Цейлона из сказки о принцах-счастливчиках).",
    tags: ["advanced", "noun", "beautiful_words"],
    dictionaryId: "dict_general",
    ankiStatus: "not_added",
    createdAt: Date.now() - 86400000 * 2,
    timesReviewed: 1,
    isMastered: false,
  },
  {
    id: "card_2",
    original: "refactor",
    translation: "рефакторить / улучшать структуру кода",
    alternatives: ["переработка кода", "оптимизация архитектуры"],
    transcription: "/riːˈfæktər/",
    partOfSpeech: "глагол",
    definition: "Изменение внутренней структуры программы без изменения её внешнего поведения.",
    exampleEn: "We should refactor this legacy module before adding the new feature.",
    exampleRu: "Нам следует отрефакторить этот устаревший модуль перед добавлением новой функции.",
    mnemonic: "Re (снова) + Factor (фактор) = сделать код заново чистым.",
    tags: ["programming", "verbs", "clean_code"],
    dictionaryId: "dict_it",
    ankiStatus: "not_added",
    createdAt: Date.now() - 86400000,
    timesReviewed: 2,
    isMastered: true,
  },
  {
    id: "card_3",
    original: "touch base",
    translation: "связаться / быстро обсудить статус",
    alternatives: ["пересечься", "сверить часы"],
    transcription: "/tʌtʃ beɪs/",
    partOfSpeech: "идиома",
    definition: "Кратко выйти на связь с кем-либо для уточнения деталей или проверки прогресса.",
    exampleEn: "Let's touch base on Friday afternoon to review the quarterly numbers.",
    exampleRu: "Давай свяжемся в пятницу после обеда, чтобы сверить квартальные показатели.",
    mnemonic: "Из бейсбола: коснуться базы, чтобы зафиксировать позицию.",
    tags: ["business", "idioms", "meetings"],
    dictionaryId: "dict_business",
    ankiStatus: "not_added",
    createdAt: Date.now() - 3600000 * 5,
    timesReviewed: 0,
    isMastered: false,
  },
];

export function loadStoredDictionaries(): Dictionary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DICTIONARIES);
    if (!raw) {
      saveStoredDictionaries(DEFAULT_DICTIONARIES);
      return DEFAULT_DICTIONARIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DICTIONARIES;
  } catch (err) {
    console.error("Error loading dictionaries from localStorage:", err);
    return DEFAULT_DICTIONARIES;
  }
}

export function saveStoredDictionaries(dictionaries: Dictionary[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DICTIONARIES, JSON.stringify(dictionaries));
  } catch (err) {
    console.error("Error saving dictionaries to localStorage:", err);
  }
}

export function loadStoredCards(): WordCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORDS);
    if (!raw) {
      saveStoredCards(INITIAL_CARDS);
      return INITIAL_CARDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CARDS;
  } catch (err) {
    console.error("Error loading cards from localStorage:", err);
    return INITIAL_CARDS;
  }
}

export function saveStoredCards(cards: WordCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(cards));
  } catch (err) {
    console.error("Error saving cards to localStorage:", err);
  }
}

export function loadStoredAnkiSettings(): AnkiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveStoredAnkiSettings(DEFAULT_ANKI_SETTINGS);
      return DEFAULT_ANKI_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const settings: AnkiSettings = { ...DEFAULT_ANKI_SETTINGS, ...parsed };
    // Automatically sanitize away any previously saved Cloze models ("Задание с пропусками")
    if (
      settings.modelName &&
      (settings.modelName.toLowerCase().includes("пропуск") ||
        settings.modelName.toLowerCase().includes("cloze"))
    ) {
      settings.modelName = "Основная";
      saveStoredAnkiSettings(settings);
    }
    return settings;
  } catch (err) {
    console.error("Error loading settings from localStorage:", err);
    return DEFAULT_ANKI_SETTINGS;
  }
}

export function saveStoredAnkiSettings(settings: AnkiSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving settings to localStorage:", err);
  }
}

/**
 * Export cards to CSV with UTF-8 BOM so Excel and Anki render Russian characters flawlessly.
 */
export function exportCardsToCsv(cards: WordCard[], dictionaries: Dictionary[]): void {
  const dictMap = new Map(dictionaries.map((d) => [d.id, d.name]));

  const headers = [
    "Word",
    "Translation",
    "Transcription",
    "PartOfSpeech",
    "Alternatives",
    "Definition",
    "ExampleEn",
    "ExampleRu",
    "Mnemonic",
    "Dictionary",
    "Tags",
    "AnkiStatus",
    "CreatedAt",
  ];

  const rows = cards.map((card) => {
    const dictName = dictMap.get(card.dictionaryId) || "Общий";
    const dateStr = new Date(card.createdAt).toISOString();
    return [
      escapeCsvCell(card.original),
      escapeCsvCell(card.translation),
      escapeCsvCell(card.transcription),
      escapeCsvCell(card.partOfSpeech),
      escapeCsvCell(card.alternatives?.join("; ") || ""),
      escapeCsvCell(card.definition || ""),
      escapeCsvCell(card.exampleEn || ""),
      escapeCsvCell(card.exampleRu || ""),
      escapeCsvCell(card.mnemonic || ""),
      escapeCsvCell(dictName),
      escapeCsvCell(card.tags?.join(" ") || ""),
      escapeCsvCell(card.ankiStatus),
      escapeCsvCell(dateStr),
    ].join(",");
  });

  // UTF-8 BOM (\uFEFF)
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `anki-cards-backup-${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Anki-friendly Tab-Separated Values (TSV/TXT) export matching user's exact template
 */
export function exportAnkiTsv(cards: WordCard[], dictionaries: Dictionary[]): void {
  const dictMap = new Map(dictionaries.map((d) => [d.id, d.name]));

  const headers = [
    "#separator:Tab",
    "#html:true",
    "#notetype:Простая",
    "#guid column:3",
    "#columns:Front\tBack\tGUID",
  ];

  const rows = cards.map((card) => {
    const dictName = dictMap.get(card.dictionaryId) || "Общий словарь";
    const frontHtml = formatCardFrontHtml(card);
    const backHtml = formatCardBackHtml(card, dictName);
    const guid = card.guid || generateAnkiGuid();

    // Escape quotes inside HTML cells for TSV
    const frontEscaped = `"${frontHtml.replace(/"/g, '""')}"`;
    const backEscaped = `"${backHtml.replace(/"/g, '""')}"`;

    return `${frontEscaped}\t${backEscaped}\t${guid}`;
  });

  const content = "\uFEFF" + headers.join("\r\n") + "\r\n" + rows.join("\r\n");
  const blob = new Blob([content], { type: "text/tab-separated-values;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `anki-direct-import-${new Date().toISOString().slice(0, 10)}.txt`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(val: string): string {
  if (val == null) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function escapeTsvCell(val: string): string {
  if (val == null) return "";
  return String(val).replace(/\t/g, " ").replace(/\r?\n/g, "<br>");
}

/**
 * Import cards from CSV text
 */
export function parseCardsFromCsv(csvText: string, defaultDictId: string): Partial<WordCard>[] {
  const clean = csvText.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]);
  const importedCards: Partial<WordCard>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < 2) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h.trim()] = values[idx] || "";
    });

    const original = rowObj["Word"] || values[0] || "";
    const translation = rowObj["Translation"] || values[1] || "";

    if (!original || !translation) continue;

    importedCards.push({
      id: "card_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      original,
      translation,
      transcription: rowObj["Transcription"] || values[2] || "",
      partOfSpeech: rowObj["PartOfSpeech"] || values[3] || "слово",
      alternatives: rowObj["Alternatives"] ? rowObj["Alternatives"].split(";").map((s) => s.trim()) : [],
      definition: rowObj["Definition"] || "",
      exampleEn: rowObj["ExampleEn"] || "",
      exampleRu: rowObj["ExampleRu"] || "",
      mnemonic: rowObj["Mnemonic"] || "",
      tags: rowObj["Tags"] ? rowObj["Tags"].split(/\s+/).filter(Boolean) : [],
      dictionaryId: defaultDictId,
      ankiStatus: "not_added",
      createdAt: Date.now(),
    });
  }

  return importedCards;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
