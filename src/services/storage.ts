import { AnkiSettings, Dictionary, WordCard, UserGoals, LevelInfo } from "../types";
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

// ----------------------------------------------------
// Goals & CEFR Levels
// ----------------------------------------------------

export const DEFAULT_GOALS: UserGoals = {
  totalGoal: 300,
  dailyGoal: 20,
  weeklyGoal: 100,
  selectedLevel: "A0",
};

export const TOTAL_GOAL_OPTIONS = [300, 800, 1500, 3000, 5000, 8000, 12000];
export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20, 30, 50, 100];
export const WEEKLY_GOAL_OPTIONS = [35, 70, 100, 150, 250, 350, 500];

export const CEFR_LEVELS: LevelInfo[] = [
  { level: "A0", name: "Начальный", min: 0, max: 300, description: "Первые базовые слова и повседневные фразы" },
  { level: "A1", name: "Элементарный", min: 300, max: 800, description: "Простые диалоги, знакомство, базовые потребности" },
  { level: "A2", name: "Базовый пользователь", min: 800, max: 1500, description: "Понимание простых текстов, описания ситуаций и планов" },
  { level: "B1", name: "Средний уровень", min: 1500, max: 3000, description: "Свободное общение на знакомые темы, путешествия, работа" },
  { level: "B2", name: "Выше среднего", min: 3000, max: 5000, description: "Понимание сложных текстов, фильмов и беглой речи" },
  { level: "C1", name: "Продвинутый", min: 5000, max: 8000, description: "Беглая спонтанная речь, научные и профессиональные темы" },
  { level: "C2", name: "Владение в совершенстве", min: 8000, max: 12000, description: "Уровень образованного носителя языка без ограничений" },
];

export function getUserCurrentLevel(
  learnedInAppCount: number,
  manualLevel?: string
): {
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  levelIndex: number;
  wordsInLevel: number;
  levelSpan: number;
  progressPercent: number;
  wordsToNextLevel: number;
  isCustomLevel: boolean;
} {
  let levelIndex = 0;

  if (manualLevel) {
    const foundIdx = CEFR_LEVELS.findIndex((lvl) => lvl.level.toUpperCase() === manualLevel.toUpperCase());
    if (foundIdx !== -1) {
      levelIndex = foundIdx;
    }
  } else {
    for (let i = 0; i < CEFR_LEVELS.length; i++) {
      if (learnedInAppCount >= CEFR_LEVELS[i].min) {
        levelIndex = i;
      }
    }
  }

  const currentLevel = CEFR_LEVELS[levelIndex];
  const nextLevel = levelIndex < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[levelIndex + 1] : null;

  // Words progress specifically within the target stage:
  // Each level requires a certain span of words to master (e.g., A0->A1 requires 300 words; A1->A2 requires 500 words).
  const levelSpan = currentLevel.max - currentLevel.min;
  // Words learned in app applied to current level:
  const wordsInLevel = Math.min(levelSpan, Math.max(0, learnedInAppCount));
  const progressPercent = Math.min(100, Math.round((wordsInLevel / levelSpan) * 100));
  const wordsToNextLevel = Math.max(0, levelSpan - wordsInLevel);

  return {
    currentLevel,
    nextLevel,
    levelIndex,
    wordsInLevel,
    levelSpan,
    progressPercent,
    wordsToNextLevel,
    isCustomLevel: Boolean(manualLevel),
  };
}

export function getCardsAddedToday(cards: WordCard[]): number {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return cards.filter((c) => (c.createdAt || 0) >= startOfDay).length;
}

export function getCardsAddedThisWeek(cards: WordCard[]): number {
  const now = new Date();
  const day = now.getDay();
  // Monday as 1st day of the week
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const startOfWeek = monday.getTime();
  return cards.filter((c) => (c.createdAt || 0) >= startOfWeek).length;
}

export function loadUserGoals(): UserGoals {
  try {
    const raw = localStorage.getItem("anki_app_goals_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        totalGoal: parsed.totalGoal || DEFAULT_GOALS.totalGoal,
        dailyGoal: parsed.dailyGoal || DEFAULT_GOALS.dailyGoal,
        weeklyGoal: parsed.weeklyGoal || DEFAULT_GOALS.weeklyGoal,
        selectedLevel: parsed.selectedLevel || DEFAULT_GOALS.selectedLevel || "A0",
      };
    }
  } catch (e) {
    console.error("Failed to load goals from localStorage", e);
  }
  return DEFAULT_GOALS;
}

export function saveUserGoals(goals: UserGoals): void {
  try {
    localStorage.setItem("anki_app_goals_v1", JSON.stringify(goals));
  } catch (e) {
    console.error("Failed to save goals to localStorage", e);
  }
}

