export interface WordCard {
  id: string;
  original: string;
  translation: string;
  alternatives: string[];
  transcription: string;
  partOfSpeech: string;
  definition: string;
  exampleEn: string;
  exampleRu: string;
  mnemonic?: string;
  tags: string[];
  dictionaryId: string;
  guid?: string;
  ankiStatus: 'not_added' | 'synced' | 'error';
  ankiNoteId?: number;
  ankiError?: string;
  createdAt: number;
  timesReviewed?: number;
  lastReviewedAt?: number;
  isMastered?: boolean;
}

export interface Dictionary {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isDefault?: boolean;
  createdAt: number;
}

export interface AnkiSettings {
  url: string;
  deckName: string;
  modelName: string;
  frontField: string;
  backField: string;
  autoCreateDeck: boolean;
  useProxy: boolean;
}

export interface TranslationData {
  original: string;
  translation: string;
  alternatives: string[];
  transcription: string;
  partOfSpeech: string;
  definition: string;
  exampleEn: string;
  exampleRu: string;
  mnemonic: string;
  tags: string[];
}

export interface UserGoals {
  totalGoal: number;
  dailyGoal: number;
  weeklyGoal: number;
  selectedLevel?: string; // e.g. "A0", "A1", "A2", "B1", "B2", "C1", "C2" (manual level choice)
}

export interface LevelInfo {
  level: string;
  name: string;
  min: number;
  max: number;
  description: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

