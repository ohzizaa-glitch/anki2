import React, { useState } from "react";
import {
  X,
  RotateCw,
  Volume2,
  Check,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
} from "lucide-react";
import { Dictionary, WordCard } from "../types";
import { playEnglishPronunciation } from "../utils/speech";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: WordCard[];
  dictionaries: Dictionary[];
  onUpdateCardReview: (cardId: string, remembered: boolean) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  cards,
  dictionaries,
  onUpdateCardReview,
}) => {
  const [selectedDictId, setSelectedDictId] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  // Filter cards to review
  const reviewCards = cards.filter((c) => {
    if (selectedDictId === "all") return true;
    return c.dictionaryId === selectedDictId;
  });

  const currentCard = reviewCards[currentIndex];

  const handleNextCard = (remembered: boolean) => {
    if (!currentCard) return;

    onUpdateCardReview(currentCard.id, remembered);

    if (remembered) {
      setRememberedCount((prev) => prev + 1);
    }

    if (currentIndex + 1 < reviewCards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setRememberedCount(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Повторение карточек
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by theme selector */}
            <select
              value={selectedDictId}
              onChange={(e) => {
                setSelectedDictId(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsFinished(false);
              }}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Все слова ({cards.length})</option>
              {dictionaries.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({cards.filter((c) => c.dictionaryId === d.id).length})
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {reviewCards.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                В выбранной категории нет слов для повторения.
              </p>
              <p className="text-xs text-slate-400">
                Добавьте новые слова в словарь, чтобы тренировать их здесь.
              </p>
            </div>
          ) : isFinished ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber-50 dark:bg-amber-950/50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                <Award className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Отличная работа!
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Вы повторили {reviewCards.length} карточек.
                </p>
                <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                  Запомнено: {rememberedCount} из {reviewCards.length} (
                  {Math.round((rememberedCount / reviewCards.length) * 100)}%)
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow"
                >
                  Повторить заново
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Завершить
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Карточка {currentIndex + 1} из {reviewCards.length}
                </span>
                <span>Нажмите на карточку, чтобы перевернуть</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / reviewCards.length) * 100}%`,
                  }}
                />
              </div>

              {/* Flashcard with 3D Flip style */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[260px] bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition shadow-sm select-none"
              >
                {!isFlipped ? (
                  // Front Side (matching Anki Front)
                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                        {currentCard.original}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playEnglishPronunciation(currentCard.original);
                        }}
                        className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 transition"
                        title="Прослушать произношение"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {currentCard.transcription && (
                      <p className="text-base font-serif italic text-slate-500 dark:text-slate-400">
                        {currentCard.transcription}
                      </p>
                    )}

                    {currentCard.exampleEn && (
                      <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-left">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {currentCard.exampleEn}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 pt-2">
                      Нажмите, чтобы увидеть перевод
                    </p>
                  </div>
                ) : (
                  // Back Side (matching Anki Back)
                  <div className="w-full max-w-sm space-y-3 animate-in fade-in">
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {currentCard.translation}
                    </span>

                    {currentCard.exampleRu && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-left">
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                          {currentCard.exampleRu}
                        </p>
                      </div>
                    )}

                    {currentCard.mnemonic && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-left text-xs text-amber-800 dark:text-amber-300">
                        💡 <strong>Мнемоника:</strong> {currentCard.mnemonic}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 text-right pt-1">
                      Словарь: {dictionaries.find((d) => d.id === currentCard.dictionaryId)?.name || "Общий словарь"}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons: Remember / Review */}
              {isFlipped && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleNextCard(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-bold transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Повторить ещё</span>
                  </button>

                  <button
                    onClick={() => handleNextCard(true)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Помню!</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
