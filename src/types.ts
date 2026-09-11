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

export type ThemeMode = 'light' | 'dark' | 'system';
