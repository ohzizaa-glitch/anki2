import React from "react";
import {
  Folder,
  Plus,
  Trash2,
  Download,
  Moon,
  Sun,
  PlayCircle,
  Database,
} from "lucide-react";
import { Dictionary, ThemeMode, WordCard } from "../types";

interface DictionaryBarProps {
  dictionaries: Dictionary[];
  activeDictionaryId: string;
  onSelectDictionary: (id: string) => void;
  onOpenNewDictModal: () => void;
  onDeleteDictionary: (id: string) => void;
  cards: WordCard[];
  onExportCsv?: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenReview?: () => void;
}

// Pastel color palette matching reference image
const PASTEL_COLORS = [
  { bg: "bg-[#c7d2fe]", border: "border-[#a5b4fc]", text: "text-slate-900" }, // Periwinkle / IT-Terms
  { bg: "bg-[#f1f5f9] dark:bg-slate-800", border: "border-slate-300 dark:border-slate-700", text: "text-slate-900 dark:text-slate-100" }, // Gray / Travel
  { bg: "bg-[#fef3c7]", border: "border-[#fde68a]", text: "text-slate-900" }, // Sand / Business
  { bg: "bg-[#d1fae5]", border: "border-[#a7f3d0]", text: "text-slate-900" }, // Mint
  { bg: "bg-[#fce7f3]", border: "border-[#fbcfe8]", text: "text-slate-900" }, // Rose
];

export const DictionaryBar: React.FC<DictionaryBarProps> = ({
  dictionaries,
  activeDictionaryId,
  onSelectDictionary,
  onOpenNewDictModal,
  onDeleteDictionary,
  cards,
  onExportCsv,
  theme,
  onToggleTheme,
  onOpenReview,
}) => {
  // Count words per dictionary
  const countsByDict = cards.reduce((acc: Record<string, number>, card) => {
    acc[card.dictionaryId] = (acc[card.dictionaryId] || 0) + 1;
    return acc;
  }, {});

  const totalCount = cards.length;

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
          МОИ КОЛОДЫ
        </h3>
        <button
          type="button"
          onClick={onOpenNewDictModal}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white underline inline-flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить колоду</span>
        </button>
      </div>

      {/* Pastel Deck Pills (Matching reference) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* All Words Pill */}
        <button
          type="button"
          onClick={() => onSelectDictionary("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-tight transition cursor-pointer border ${
            activeDictionaryId === "all"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-400"
          }`}
        >
          <span>Все слова</span>
          <span className="ml-1.5 opacity-80">({totalCount})</span>
        </button>

        {/* Dictionary Pastel Chips */}
        {dictionaries.map((dict, idx) => {
          const count = countsByDict[dict.id] || 0;
          const isActive = activeDictionaryId === dict.id;
          const color = PASTEL_COLORS[idx % PASTEL_COLORS.length];
          const canDelete = dict.id !== "dict_general";

          return (
            <div
              key={dict.id}
              className={`inline-flex items-center rounded-full text-xs font-black tracking-tight transition border ${
                color.bg
              } ${color.border} ${color.text} ${
                isActive
                  ? "ring-2 ring-offset-1 ring-slate-950 dark:ring-white shadow-sm"
                  : "hover:opacity-90"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectDictionary(dict.id)}
                className="py-1.5 pl-3.5 pr-2 flex items-center cursor-pointer select-none"
              >
                <span>{dict.name}</span>
                <span className="ml-1.5 opacity-80">({count})</span>
              </button>

              {/* Delete custom dictionary button */}
              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDictionary(dict.id);
                  }}
                  title={`Удалить колоду "${dict.name}" (слова переместятся в общий словарь)`}
                  className="pr-2.5 pl-1 py-1 text-slate-700 hover:text-rose-600 transition cursor-pointer flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5 hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          );
        })}

        {/* Quick Add Pill */}
        <button
          type="button"
          onClick={onOpenNewDictModal}
          className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500 transition inline-flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Добавить</span>
        </button>
      </div>

      {/* Action Pills Row: "БЭКАП В CSV 💾", "Темная тема 🌙", "Удалить выбранную колоду" */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* If a custom deck is active, provide a clear direct Delete button */}
        {activeDictionaryId !== "all" && activeDictionaryId !== "dict_general" && (
          <button
            type="button"
            onClick={() => onDeleteDictionary(activeDictionaryId)}
            title="Удалить выбранную колоду (карточки переместятся в общий словарь)"
            className="px-3.5 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 active:scale-95 text-rose-900 dark:text-rose-200 font-bold text-xs border border-rose-300 dark:border-rose-800 transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Удалить эту колоду</span>
          </button>
        )}
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            title="Скачать резервную копию всех слов в CSV"
            className="px-3.5 py-1.5 rounded-full bg-[#bfdbfe] hover:bg-[#93c5fd] active:scale-95 text-slate-950 font-black text-xs border border-[#93c5fd] transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>БЭКАП В CSV</span>
            <span>💾</span>
          </button>
        )}

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-900 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Светлая тема</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Темная тема</span>
              </>
            )}
          </button>
        )}

        {onOpenReview && (
          <button
            type="button"
            onClick={onOpenReview}
            className="px-3.5 py-1.5 rounded-full bg-[#fbcfe8] hover:bg-[#f472b6] active:scale-95 text-slate-950 font-black text-xs border border-[#f472b6] transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Повторить карточки ({totalCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
