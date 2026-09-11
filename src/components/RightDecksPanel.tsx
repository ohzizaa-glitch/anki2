import React from "react";
import { Dictionary, ThemeMode, WordCard } from "../types";
import { DictionaryBar } from "./DictionaryBar";
import { WordList } from "./WordList";

interface RightDecksPanelProps {
  dictionaries: Dictionary[];
  activeDictionaryId: string;
  onSelectDictionary: (id: string) => void;
  onOpenNewDictModal: () => void;
  onDeleteDictionary: (id: string) => void;
  cards: WordCard[];
  onDeleteCard: (id: string) => void;
  onSyncSingleCard: (card: WordCard) => Promise<{ success: boolean; error?: string }>;
  onSyncAllCards: () => Promise<void>;
  onExportCsv: () => void;
  onExportAnkiTsv: () => void;
  onImportCsv: (csvContent: string) => void;
  ankiConnected: boolean | null;
  onOpenSettings?: () => void;
  onOpenGuideModal?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenReview: () => void;
}

export const RightDecksPanel: React.FC<RightDecksPanelProps> = ({
  dictionaries,
  activeDictionaryId,
  onSelectDictionary,
  onOpenNewDictModal,
  onDeleteDictionary,
  cards,
  onDeleteCard,
  onSyncSingleCard,
  onSyncAllCards,
  onExportCsv,
  onExportAnkiTsv,
  onImportCsv,
  ankiConnected,
  theme,
  onToggleTheme,
  onOpenReview,
}) => {
  return (
    <div className="bg-[#f7f4ea] dark:bg-[#111e38] text-slate-900 dark:text-slate-100 rounded-3xl p-5 sm:p-7 shadow-xl border border-stone-200 dark:border-stone-800 space-y-6 relative">
      {/* Top Header: МОИ СЛОВАРИ И КАРТОЧКИ */}
      <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-tight">
          МОИ СЛОВАРИ И КАРТОЧКИ
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Колоды Anki, быстрый бэкап и список сохраненных слов
        </p>
      </div>

      {/* 1. МОИ КОЛОДЫ & Actions (Pastel pills) */}
      <DictionaryBar
        dictionaries={dictionaries}
        activeDictionaryId={activeDictionaryId}
        onSelectDictionary={onSelectDictionary}
        onOpenNewDictModal={onOpenNewDictModal}
        onDeleteDictionary={onDeleteDictionary}
        cards={cards}
        onExportCsv={onExportCsv}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenReview={onOpenReview}
      />

      {/* 2. СОХРАНЕННЫЕ СЛОВА (Word card list & filters) */}
      <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800">
        <WordList
          cards={cards}
          dictionaries={dictionaries}
          activeDictionaryId={activeDictionaryId}
          onDeleteCard={onDeleteCard}
          onSyncSingleCard={onSyncSingleCard}
          onSyncAllCards={onSyncAllCards}
          onExportCsv={onExportCsv}
          onExportAnkiTsv={onExportAnkiTsv}
          onImportCsv={onImportCsv}
          ankiConnected={ankiConnected}
        />
      </div>
    </div>
  );
};
