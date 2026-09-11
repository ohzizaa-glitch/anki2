import React, { useState, useRef } from "react";
import {
  Volume2,
  Check,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Plus,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Dictionary, WordCard } from "../types";
import { playEnglishPronunciation } from "../utils/speech";
import { PinkBlobMascot, BlueCubeMascot, SpeechBubble } from "./MascotCharacters";

interface WordInputFormProps {
  dictionaries: Dictionary[];
  activeDictionaryId: string;
  onSelectDictionary: (id: string) => void;
  onOpenNewDictModal: () => void;
  onAddCard: (
    card: Omit<WordCard, "id" | "createdAt">,
    syncToAnkiImmediately: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  ankiConnected: boolean | null;
  onOpenGuide: () => void;
}

export const WordInputForm: React.FC<WordInputFormProps> = ({
  dictionaries,
  activeDictionaryId,
  onSelectDictionary,
  onOpenNewDictModal,
  onAddCard,
  ankiConnected,
  onOpenGuide,
}) => {
  const [originalWord, setOriginalWord] = useState("");
  const [translationText, setTranslationText] = useState("");
  const [transcription, setTranscription] = useState("");
  const [exampleEn, setExampleEn] = useState("");
  const [exampleRu, setExampleRu] = useState("");
  const [mnemonic, setMnemonic] = useState("");

  const [showExtraFields, setShowExtraFields] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAddedSuccess, setJustAddedSuccess] = useState(false);

  const originalInputRef = useRef<HTMLInputElement>(null);
  const translationInputRef = useRef<HTMLInputElement>(null);

  const activeDict = dictionaries.find((d) => d.id === activeDictionaryId) || dictionaries[0];

  // Key navigation: Enter from word moves to translation (or creates card if both filled)
  const handleWordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!originalWord.trim()) {
        setError("Введите английское слово");
        return;
      }
      if (!translationText.trim()) {
        translationInputRef.current?.focus();
      } else {
        handleCreateCard(true);
      }
    }
  };

  const handleTranslationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateCard(true);
    }
  };

  // Create card and send to Anki or save locally
  const handleCreateCard = async (sendToAnki: boolean) => {
    const trimmedWord = originalWord.trim();
    const trimmedTranslation = translationText.trim();

    if (!trimmedWord) {
      setError("Пожалуйста, укажите английское слово или фразу");
      originalInputRef.current?.focus();
      return;
    }

    if (!trimmedTranslation) {
      setError("Пожалуйста, укажите перевод на русский");
      translationInputRef.current?.focus();
      return;
    }

    setIsAdding(true);
    setError(null);

    const cardPayload: Omit<WordCard, "id" | "createdAt"> = {
      original: trimmedWord,
      translation: trimmedTranslation,
      alternatives: [],
      transcription: transcription.trim() || undefined as any,
      partOfSpeech: "",
      definition: "",
      exampleEn: exampleEn.trim() || undefined as any,
      exampleRu: exampleRu.trim() || undefined as any,
      mnemonic: mnemonic.trim() || undefined as any,
      tags: [activeDict?.name.toLowerCase().replace(/\s+/g, "_") || "english"],
      dictionaryId:
        activeDictionaryId === "all" ? dictionaries[0]?.id || "dict_general" : activeDictionaryId,
      ankiStatus: "not_added",
    };

    const res = await onAddCard(cardPayload, sendToAnki);

    setIsAdding(false);
    if (res.success) {
      setJustAddedSuccess(true);
      setOriginalWord("");
      setTranslationText("");
      setTranscription("");
      setExampleEn("");
      setExampleRu("");
      setMnemonic("");
      setShowExtraFields(false);

      setTimeout(() => {
        setJustAddedSuccess(false);
        originalInputRef.current?.focus();
      }, 1500);
    } else {
      setError(res.error || "Не удалось сохранить карточку");
    }
  };

  return (
    <div className="bg-[#0e214d] text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#1d3570] relative overflow-hidden flex flex-col justify-between">
      {/* Background Decorative Retro Stars */}
      <div className="absolute top-6 right-6 pointer-events-none opacity-25">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="#bef264">
          <path d="M50 0 L56 36 L92 20 L66 48 L100 50 L66 52 L92 80 L56 64 L50 100 L44 64 L8 80 L34 52 L0 50 L34 48 L8 20 L44 36 Z" />
        </svg>
      </div>
      <div className="absolute bottom-16 -left-4 pointer-events-none opacity-15">
        <svg width="64" height="64" viewBox="0 0 100 100" fill="#ff6b9d">
          <path d="M50 0 L56 36 L92 20 L66 48 L100 50 L66 52 L92 80 L56 64 L50 100 L44 64 L8 80 L34 52 L0 50 L34 48 L8 20 L44 36 Z" />
        </svg>
      </div>

      <div>
        {/* Top Header - Bold Neon Green text */}
        <div className="mb-5">
          <div className="text-[12px] font-black tracking-widest text-[#bef264] uppercase opacity-90">
            LEXISYNC:
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#bef264] uppercase leading-tight">
            ДОБАВЛЕНИЕ СЛОВ
          </h2>
        </div>

        {/* The Container Card with Pink Mascot peeking */}
        <div className="relative pt-6">
          {/* Pink Mascot peeking over the card */}
          <div className="absolute -top-7 right-4 z-10 transition-transform duration-300 hover:-translate-y-1">
            <PinkBlobMascot size={68} />
          </div>

          {/* Main Ivory/White Container Card */}
          <div className="bg-[#fcfaf5] text-slate-900 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200 space-y-4">
            {/* Field: Колода */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Колода:
                </label>
                <button
                  type="button"
                  onClick={onOpenNewDictModal}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Создать новую</span>
                </button>
              </div>

              <div className="relative">
                <select
                  value={activeDictionaryId}
                  onChange={(e) => onSelectDictionary(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold bg-[#f1eedf] hover:bg-[#eae6d4] text-slate-900 rounded-2xl px-4 py-2.5 pr-10 border border-slate-300/80 focus:outline-none focus:ring-2 focus:ring-[#bef264] transition cursor-pointer appearance-none"
                >
                  {dictionaries.map((dict) => (
                    <option key={dict.id} value={dict.id}>
                      📁 {dict.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field: Английское слово */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 block mb-1.5">
                Английское слово или фраза:
              </label>
              <div className="relative">
                <input
                  ref={originalInputRef}
                  type="text"
                  value={originalWord}
                  onChange={(e) => setOriginalWord(e.target.value)}
                  onKeyDown={handleWordKeyDown}
                  placeholder="seamless, ubiquitous, turn a blind eye..."
                  className="w-full text-base sm:text-lg font-bold px-4 py-3 rounded-2xl bg-white text-slate-950 placeholder-slate-400 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-inner pr-16"
                  autoComplete="off"
                  autoFocus
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {originalWord.trim() && (
                    <>
                      <button
                        type="button"
                        onClick={() => playEnglishPronunciation(originalWord)}
                        title="Озвучить слово"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOriginalWord("");
                          originalInputRef.current?.focus();
                        }}
                        title="Очистить"
                        className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Field: Перевод на русский */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 block mb-1.5">
                Перевод на русский:
              </label>
              <div className="relative">
                <input
                  ref={translationInputRef}
                  type="text"
                  value={translationText}
                  onChange={(e) => setTranslationText(e.target.value)}
                  onKeyDown={handleTranslationKeyDown}
                  placeholder="бесшовный, плавный, непрерывный..."
                  className="w-full text-base sm:text-lg font-bold px-4 py-3 rounded-2xl bg-white text-slate-950 placeholder-slate-400 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-inner pr-10"
                />
                {translationText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranslationText("");
                      translationInputRef.current?.focus();
                    }}
                    title="Очистить"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Toggle Extra Fields (Transcription, Example sentence, Mnemonic) */}
            <div>
              <button
                type="button"
                onClick={() => setShowExtraFields(!showExtraFields)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer py-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {showExtraFields
                    ? "Скрыть пример и транскрипцию"
                    : "+ Пример предложения, транскрипция, заметка (опционально)"}
                </span>
              </button>

              {showExtraFields && (
                <div className="mt-3 p-3.5 bg-[#f1eedf] rounded-2xl border border-slate-300/80 space-y-3 animate-in fade-in duration-200">
                  {/* Transcription */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                      Транскрипция:
                    </label>
                    <input
                      type="text"
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      placeholder="/ˈsiːm.ləs/"
                      className="w-full text-xs font-mono font-medium px-3 py-2 rounded-xl bg-white text-slate-950 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Example sentence English */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                      Пример предложения (на английском):
                    </label>
                    <input
                      type="text"
                      value={exampleEn}
                      onChange={(e) => setExampleEn(e.target.value)}
                      placeholder="The software offers seamless integration with cloud tools."
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white text-slate-950 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Example sentence Russian */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                      Перевод примера:
                    </label>
                    <input
                      type="text"
                      value={exampleRu}
                      onChange={(e) => setExampleRu(e.target.value)}
                      placeholder="Программа предлагает бесшовную интеграцию с облачными инструментами."
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white text-slate-950 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mnemonic / Note */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                      Заметка или мнемоника для запоминания:
                    </label>
                    <input
                      type="text"
                      value={mnemonic}
                      onChange={(e) => setMnemonic(e.target.value)}
                      placeholder="Seam (шов) + less (без) = без единого шва, гладко"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white text-slate-950 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Success notification */}
        {justAddedSuccess && (
          <div className="mt-3 p-3 rounded-2xl bg-lime-400/20 border border-lime-400/50 text-[#bef264] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 text-[#bef264]" />
              <span>Карточка успешно сохранена!</span>
            </div>
            <span className="text-[11px] text-white/80">Готово к следующему слову</span>
          </div>
        )}
      </div>

      {/* Bottom Area: Mascots with Speech Bubbles & Big Neon Lime Pill Button */}
      <div className="mt-6 space-y-4">
        {/* Mascot & Status row */}
        <div className="flex items-center justify-between px-2">
          {/* Blue Cube with Headphones */}
          <div className="flex items-center gap-2.5">
            <BlueCubeMascot size={58} />
            <SpeechBubble
              tailDirection="left"
              text={
                ankiConnected
                  ? "AnkiConnect подключен! ⚡"
                  : "Запусти Anki Desktop!"
              }
              className={
                ankiConnected
                  ? "bg-[#bef264] text-slate-950 font-black"
                  : "bg-[#fed7aa] text-amber-950 font-bold"
              }
            />
          </div>

          {/* Quick Anki Status Indicator */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-[11px] font-bold text-white/70 hover:text-white underline hidden sm:inline cursor-pointer"
          >
            {ankiConnected ? "Порт 8765 активен" : "Как подключить Anki?"}
          </button>
        </div>

        {/* BIG NEON LIME PILL BUTTON */}
        <button
          type="button"
          onClick={() => handleCreateCard(true)}
          disabled={isAdding || !originalWord.trim()}
          className="w-full py-4 sm:py-4.5 px-6 rounded-full bg-[#bef264] hover:bg-[#aef037] active:scale-[0.98] text-slate-950 font-black text-base sm:text-lg tracking-tight uppercase shadow-lg shadow-[#bef264]/25 transition duration-150 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none"
        >
          {isAdding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-black" />
              <span>СОЗДАНИЕ КАРТОЧКИ...</span>
            </>
          ) : (
            <>
              <span>СОЗДАТЬ КАРТОЧКУ ANKI</span>
              <span className="text-xs font-black tracking-normal px-2 py-0.5 rounded-full bg-black/10">
                Enter ↵
              </span>
              <Check className="w-5 h-5 stroke-[3]" />
            </>
          )}
        </button>

        {/* Secondary Save locally (without Anki) */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => handleCreateCard(false)}
            disabled={isAdding || !originalWord.trim()}
            className="text-xs font-semibold text-white/70 hover:text-white underline transition cursor-pointer"
          >
            Сохранить только в локальный словарь (без Anki)
          </button>
        </div>
      </div>
    </div>
  );
};
