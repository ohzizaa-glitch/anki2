import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  Volume2,
  Trash2,
  CheckCircle2,
  Download,
  Upload,
  Send,
  Sparkles,
  FileSpreadsheet,
  ArrowUpDown,
  Check,
  Plus,
} from "lucide-react";
import { Dictionary, WordCard } from "../types";
import { playEnglishPronunciation } from "../utils/speech";

interface WordListProps {
  cards: WordCard[];
  dictionaries: Dictionary[];
  activeDictionaryId: string;
  onDeleteCard: (id: string) => void;
  onSyncSingleCard: (card: WordCard) => Promise<{ success: boolean; error?: string }>;
  onSyncAllCards: () => Promise<void>;
  onExportCsv: () => void;
  onExportAnkiTsv: () => void;
  onImportCsv: (csvContent: string) => void;
  ankiConnected: boolean | null;
}

export const WordList: React.FC<WordListProps> = ({
  cards,
  dictionaries,
  activeDictionaryId,
  onDeleteCard,
  onSyncSingleCard,
  onSyncAllCards,
  onExportCsv,
  onExportAnkiTsv,
  onImportCsv,
  ankiConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "not_added" | "synced">("all");
  const [sortBy, setSortBy] = useState<"newest" | "alpha">("newest");
  const [syncingCardId, setSyncingCardId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dictMap = useMemo(() => {
    return new Map(dictionaries.map((d) => [d.id, d]));
  }, [dictionaries]);

  // Filter cards by dictionary, search, and status
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        // Dict filter
        if (activeDictionaryId !== "all" && card.dictionaryId !== activeDictionaryId) {
          return false;
        }
        // Status filter
        if (filterStatus === "not_added" && card.ankiStatus === "synced") {
          return false;
        }
        if (filterStatus === "synced" && card.ankiStatus !== "synced") {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchWord = card.original.toLowerCase().includes(q);
          const matchTrans = card.translation.toLowerCase().includes(q);
          const matchEx = card.exampleEn?.toLowerCase().includes(q) || false;
          const matchTag = card.tags?.some((t) => t.toLowerCase().includes(q)) || false;
          return matchWord || matchTrans || matchEx || matchTag;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "alpha") {
          return a.original.localeCompare(b.original);
        }
        return b.createdAt - a.createdAt;
      });
  }, [cards, activeDictionaryId, filterStatus, searchQuery, sortBy]);

  const unsyncedCount = cards.filter((c) => c.ankiStatus !== "synced").length;

  const handleSyncCard = async (card: WordCard) => {
    setSyncingCardId(card.id);
    await onSyncSingleCard(card);
    setSyncingCardId(null);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    await onSyncAllCards();
    setIsSyncingAll(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        onImportCsv(text);
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Title and batch controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              СОХРАНЕННЫЕ СЛОВА ({filteredCards.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Словарь и синхронизация с Anki
          </p>
        </div>

        {/* Data export/import and sync buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {unsyncedCount > 0 && (
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              title="Синхронизировать все новые слова с Anki"
              className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#bef264] hover:bg-[#a3e635] text-slate-950 border border-[#a3e635] shadow-xs inline-flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSyncingAll ? "Отправка..." : `В Anki все (${unsyncedCount})`}</span>
            </button>
          )}

          {/* Export Anki TSV */}
          <button
            type="button"
            onClick={onExportAnkiTsv}
            title="Экспорт файла для ручного импорта в Anki"
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition inline-flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Для Anki (.txt)</span>
          </button>

          {/* Import CSV */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Импортировать карточки из CSV"
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition inline-flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Импорт</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по словам, переводу, контексту..."
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#bef264]"
          />
        </div>

        {/* Status filter tabs (Pill style) */}
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800/70 p-1 rounded-full shrink-0">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              filterStatus === "all"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
            }`}
          >
            Все ({cards.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("not_added")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              filterStatus === "not_added"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
            }`}
          >
            Не в Anki ({unsyncedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("synced")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              filterStatus === "synced"
                ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
            }`}
          >
            В Anki ({cards.length - unsyncedCount})
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="newest">Сначала новые</option>
            <option value="alpha">По алфавиту (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Cards list */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-2 bg-white/40 dark:bg-slate-900/40">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {searchQuery
              ? "Ничего не найдено по вашему запросу"
              : "В этой колоде пока нет слов"}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Используйте форму слева (или вкладку «Добавить»), чтобы добавить новое слово с ИИ-переводом!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredCards.map((card) => {
            const dict = dictMap.get(card.dictionaryId);
            const isSyncing = syncingCardId === card.id;

            return (
              <div
                key={card.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between space-y-2.5"
              >
                <div>
                  {/* Word, audio button, status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {card.original}
                      </span>
                      <button
                        type="button"
                        onClick={() => playEnglishPronunciation(card.original)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        title="Озвучить слово"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      {card.transcription && (
                        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                          {card.transcription}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {card.ankiStatus === "synced" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>В Anki</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSyncCard(card)}
                          disabled={isSyncing}
                          title="Отправить карточку в Anki"
                          className="inline-flex items-center gap-1 text-[11px] font-black text-slate-950 bg-[#bef264] hover:bg-[#a3e635] px-2.5 py-0.5 rounded-full border border-[#a3e635] transition cursor-pointer shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isSyncing ? "..." : "+ В Anki"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Translation */}
                  <div className="flex flex-wrap items-baseline gap-2 mt-1">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {card.translation}
                    </span>
                    {card.partOfSpeech && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wide">
                        {card.partOfSpeech}
                      </span>
                    )}
                  </div>

                  {/* Example */}
                  {card.exampleEn && (
                    <div className="mt-2 text-xs p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                      <p className="font-semibold text-blue-700 dark:text-blue-300 text-xs sm:text-[13px] leading-relaxed">
                        {card.exampleEn}
                      </p>
                      {card.exampleRu && (
                        <p className="text-emerald-700 dark:text-emerald-400 text-xs mt-1.5 pt-1.5 border-t border-blue-100 dark:border-blue-900/40 leading-relaxed font-medium">
                          {card.exampleRu}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mnemonic */}
                  {card.mnemonic && (
                    <div className="mt-2 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 font-medium">
                      💡 {card.mnemonic}
                    </div>
                  )}
                </div>

                {/* Footer: Dictionary & Delete */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      📁 {dict?.name || "Общий"}
                    </span>
                    <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteCard(card.id)}
                    className="p-1 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Удалить карточку"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
