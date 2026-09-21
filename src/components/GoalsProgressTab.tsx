import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Target,
  Trophy,
  TrendingUp,
  HelpCircle,
  Pencil,
  Check,
  Lock,
  Star,
  X,
  Sparkles,
  CalendarDays,
  Settings2,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { WordCard, UserGoals, LevelInfo } from "../types";
import {
  CEFR_LEVELS,
  getUserCurrentLevel,
  getCardsAddedToday,
  getCardsAddedThisWeek,
  TOTAL_GOAL_OPTIONS,
  DAILY_GOAL_OPTIONS,
  WEEKLY_GOAL_OPTIONS,
  saveUserGoals,
} from "../services/storage";

interface GoalsProgressTabProps {
  cards: WordCard[];
  goals: UserGoals;
  onUpdateGoals: (newGoals: UserGoals) => void;
  onSwitchToAddTab: () => void;
}

export const GoalsProgressTab: React.FC<GoalsProgressTabProps> = ({
  cards,
  goals,
  onUpdateGoals,
  onSwitchToAddTab,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLevelSelectModalOpen, setIsLevelSelectModalOpen] = useState(false);

  // Temporary editing state for the goals modal
  const [tempGoals, setTempGoals] = useState<UserGoals>(goals);
  const [customDailyInput, setCustomDailyInput] = useState<string>(String(goals.dailyGoal || 20));

  // Keep temp state in sync when goals change
  useEffect(() => {
    setTempGoals(goals);
    setCustomDailyInput(String(goals.dailyGoal || 20));
  }, [goals]);

  // Words created/learned specifically inside this application
  const learnedInAppWords = cards.length;
  const todayCount = getCardsAddedToday(cards);
  const weekCount = getCardsAddedThisWeek(cards);

  // Active level calculation considering user-selected starting level
  const userChosenLevel = goals.selectedLevel || "A0";
  const {
    currentLevel,
    nextLevel,
    levelIndex,
    wordsInLevel,
    levelSpan,
    progressPercent: levelProgressPercent,
    wordsToNextLevel,
  } = getUserCurrentLevel(learnedInAppWords, userChosenLevel);

  // Progressive level goal: The target for the current level stage
  // If user sets A1, goal is 800 (level max). When reached, target becomes B1 (1500), etc.
  const progressiveTargetWords = currentLevel.max;
  const progressiveTargetPercent = Math.min(
    100,
    Math.round((learnedInAppWords / progressiveTargetWords) * 100)
  );
  const wordsToProgressiveTarget = Math.max(0, progressiveTargetWords - learnedInAppWords);

  // Daily Goal calculations
  const dailyGoal = goals.dailyGoal || 20;
  const dailyGoalPercent = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  // Weekly Goal calculations
  const weeklyGoal = goals.weeklyGoal || 100;
  const weeklyGoalPercent = Math.min(100, Math.round((weekCount / weeklyGoal) * 100));

  const handleOpenEdit = () => {
    setTempGoals(goals);
    setCustomDailyInput(String(goals.dailyGoal || 20));
    setIsEditModalOpen(true);
  };

  const handleSaveGoals = () => {
    const parsedDaily = parseInt(customDailyInput, 10);
    const finalDaily = !isNaN(parsedDaily) && parsedDaily > 0 ? parsedDaily : tempGoals.dailyGoal || 20;

    const updated: UserGoals = {
      ...tempGoals,
      dailyGoal: finalDaily,
      weeklyGoal: Math.max(finalDaily * 5, tempGoals.weeklyGoal || 100),
    };

    onUpdateGoals(updated);
    saveUserGoals(updated);
    setIsEditModalOpen(false);
  };

  const handleSelectLevel = (levelCode: string) => {
    const targetLvl = CEFR_LEVELS.find((l) => l.level === levelCode);
    const newTotalGoal = targetLvl ? targetLvl.max : goals.totalGoal;

    const updated: UserGoals = {
      ...goals,
      selectedLevel: levelCode,
      totalGoal: newTotalGoal,
    };
    onUpdateGoals(updated);
    saveUserGoals(updated);
    setIsLevelSelectModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* 1. TOP CARD: ВСЕГО ВЫУЧЕНО СЛОВ В ПРИЛОЖЕНИИ                 */}
      {/* ============================================================ */}
      <div className="bg-[#0e214d] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#1d3570] relative overflow-hidden">
        {/* Background ambient stars */}
        <div className="absolute top-4 right-1/3 pointer-events-none opacity-20 hidden md:block">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="#38bdf8">
            <polygon points="50,0 62,38 100,50 62,62 50,100 38,62 0,50 38,38" />
          </svg>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Information & Metric */}
          <div className="flex-1 space-y-5">
            {/* Header with Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#142d69] border border-[#234594] flex items-center justify-center text-blue-300 shadow-inner shrink-0">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                    ВЫУЧЕНО В ПРИЛОЖЕНИИ
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#38bdf8] text-[11px] font-black tracking-wide">
                    Уровень {currentLevel.level}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Слова, добавленные и отрабатываемые именно через приложение.
                </p>
              </div>
            </div>

            {/* Big Stat + Pill Badge */}
            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#bef264] drop-shadow-sm font-sans">
                {learnedInAppWords.toLocaleString("ru-RU")}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#163833] border border-[#22c55e]/30 text-[#4ade80] text-xs font-black shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+{todayCount > 0 ? todayCount : learnedInAppWords}</span>
                <span className="text-[10px] font-normal text-slate-300 ml-0.5">в приложении</span>
              </div>
            </div>

            {/* Progressive Level Target Progress Bar & Counter */}
            <div className="space-y-2 pt-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3.5 sm:h-4 bg-[#0a1838] border border-[#1b3470] rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#bef264] via-[#4ade80] to-[#38bdf8] transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.max(learnedInAppWords > 0 ? 3 : 0, progressiveTargetPercent)}%` }}
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 tracking-tight whitespace-nowrap">
                  <span className="text-[#bef264] font-black">{learnedInAppWords.toLocaleString("ru-RU")}</span>{" "}
                  / {progressiveTargetWords.toLocaleString("ru-RU")} слов
                </div>
              </div>

              {/* Sub-label: Progressive Step Target */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>
                    {wordsToProgressiveTarget > 0 ? (
                      <>
                        Цель уровня <strong className="text-white font-bold">{currentLevel.level}</strong>: осталось{" "}
                        <strong className="text-[#bef264] font-bold">
                          {wordsToProgressiveTarget.toLocaleString("ru-RU")} слов
                        </strong>
                      </>
                    ) : (
                      <>
                        🎉 Цель уровня <strong className="text-[#bef264] font-bold">{currentLevel.level}</strong> выполнена!{" "}
                        {nextLevel && (
                          <span>Переходим к <strong>{nextLevel.level}</strong> (+{nextLevel.max - currentLevel.max} слов)</span>
                        )}
                      </>
                    )}
                  </span>
                </div>

                {nextLevel && (
                  <span className="text-[11px] text-slate-400 font-semibold bg-[#11295e] px-2.5 py-0.5 rounded-lg border border-[#1b3470]">
                    Следующая цель: {nextLevel.level} ({nextLevel.max.toLocaleString("ru-RU")} слов)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Mascot: Cute Pink Blob Reading Book (Vector matching screenshot) */}
          <div className="relative shrink-0 flex items-center justify-center lg:justify-end self-center lg:self-auto py-2">
            <div className="relative flex flex-col items-center">
              {/* Handwritten style quote bubble */}
              <div className="absolute -top-3 right-0 transform translate-x-2 -translate-y-2 select-none pointer-events-none">
                <span className="text-[12px] sm:text-[13px] font-semibold text-slate-200 italic tracking-wide text-right block max-w-[130px] leading-tight drop-shadow">
                  Каждое слово делает тебя сильнее!
                </span>
              </div>

              {/* Vector mascot SVG */}
              <svg
                width="140"
                height="130"
                viewBox="0 0 140 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
              >
                <defs>
                  {/* Pink Body Gradient */}
                  <radialGradient id="pinkBlobGrad" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ff8bb7" />
                    <stop offset="65%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#be123c" />
                  </radialGradient>
                  {/* Star Glow */}
                  <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Decorative 4-point glowing stars */}
                <g filter="url(#starGlow)" opacity="0.6">
                  {/* Top-right star */}
                  <path
                    d="M125 15 C125 22 122 25 115 25 C122 25 125 28 125 35 C125 28 128 25 135 25 C128 25 125 22 125 15 Z"
                    fill="#38bdf8"
                  />
                  {/* Left middle star */}
                  <path
                    d="M15 45 C15 50 13 52 8 52 C13 52 15 54 15 59 C15 54 17 52 22 52 C17 52 15 50 15 45 Z"
                    fill="#bef264"
                  />
                  {/* Small sparkle */}
                  <circle cx="28" cy="20" r="1.8" fill="#bef264" />
                  <circle cx="120" cy="85" r="1.8" fill="#38bdf8" />
                </g>

                {/* Main Pink Character Body */}
                <circle cx="70" cy="72" r="42" fill="url(#pinkBlobGrad)" />

                {/* Cheeks Blush */}
                <ellipse cx="48" cy="74" rx="5" ry="3" fill="#f43f5e" opacity="0.7" />
                <ellipse cx="92" cy="74" rx="5" ry="3" fill="#f43f5e" opacity="0.7" />

                {/* Cute Eyes */}
                <ellipse cx="56" cy="67" rx="3.5" ry="4.5" fill="#1e1b4b" />
                <circle cx="55" cy="65" r="1.3" fill="white" />
                <ellipse cx="84" cy="67" rx="3.5" ry="4.5" fill="#1e1b4b" />
                <circle cx="83" cy="65" r="1.3" fill="white" />

                {/* Sweet smile */}
                <path
                  d="M66 73 Q70 77 74 73"
                  stroke="#1e1b4b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Little paws holding book */}
                <ellipse cx="44" cy="94" rx="7" ry="5.5" fill="#f43f5e" />
                <ellipse cx="96" cy="94" rx="7" ry="5.5" fill="#f43f5e" />

                {/* The Open Book */}
                <g transform="translate(42, 82)">
                  {/* Left Page */}
                  <path
                    d="M28 26 C20 23 8 24 2 27 L2 6 C8 3 20 2 28 6 Z"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  {/* Right Page */}
                  <path
                    d="M28 26 C36 23 48 24 54 27 L54 6 C48 3 36 2 28 6 Z"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  {/* Spine */}
                  <line x1="28" y1="6" x2="28" y2="26" stroke="#38bdf8" strokeWidth="1.5" />
                  {/* Letters on pages */}
                  <text
                    x="15"
                    y="18"
                    fill="#bef264"
                    fontSize="11"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    A
                  </text>
                  <text
                    x="41"
                    y="18"
                    fill="#bef264"
                    fontSize="11"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    Z
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MIDDLE CARD: ДОБАВЛЕНО СЕГОДНЯ                             */}
      {/* ============================================================ */}
      <div className="bg-[#0e214d] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#1d3570] relative overflow-hidden">
        {/* Background ambient star */}
        <div className="absolute top-5 right-1/4 pointer-events-none opacity-20 hidden md:block">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="#bef264">
            <polygon points="50,0 62,38 100,50 62,62 50,100 38,62 0,50 38,38" />
          </svg>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Today Metrics */}
          <div className="flex-1 space-y-5">
            {/* Header with Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#142d69] border border-[#234594] flex items-center justify-center text-sky-400 shadow-inner shrink-0">
                <Calendar className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  ДОБАВЛЕНО СЕГОДНЯ
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Сколько новых слов ты добавил в свои карточки сегодня.
                </p>
              </div>
            </div>

            {/* Big Stat + Pill Badge */}
            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#38bdf8] drop-shadow-sm font-sans">
                {todayCount}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0e3355] border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-black shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+{todayCount}</span>
                <span className="text-[10px] font-normal text-slate-300 ml-0.5">за сегодня</span>
              </div>
            </div>

            {/* Progress Bar & Counter */}
            <div className="space-y-2 pt-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3.5 sm:h-4 bg-[#0a1838] border border-[#1b3470] rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#60a5fa] to-[#818cf8] transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.max(todayCount > 0 ? 4 : 0, dailyGoalPercent)}%` }}
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 tracking-tight whitespace-nowrap">
                  <span className="text-[#38bdf8] font-black">{todayCount}</span> / {goals.dailyGoal}
                </div>
              </div>

              {/* Encouragement Footer */}
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium pt-1">
                <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  {todayCount >= goals.dailyGoal ? (
                    <strong className="text-[#bef264] font-bold">
                      Дневная цель выполнена! Отличный результат! 🚀
                    </strong>
                  ) : todayCount > 0 ? (
                    "Отличный темп! Продолжай в том же духе."
                  ) : (
                    <>
                      Добавь ещё{" "}
                      <strong className="text-white font-bold">
                        {goals.dailyGoal - todayCount} слов
                      </strong>
                      , чтобы выполнить цель на сегодня!
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right Mascot: Cute Lilac Smiling Cat (Vector matching screenshot) */}
          <div className="relative shrink-0 flex items-center justify-center lg:justify-end self-center lg:self-auto py-2">
            <div className="relative flex flex-col items-center">
              {/* Handwritten quote bubble */}
              <div className="absolute -top-3 right-0 transform translate-x-2 -translate-y-2 select-none pointer-events-none">
                <span className="text-[12px] sm:text-[13px] font-semibold text-slate-200 italic tracking-wide text-right block max-w-[130px] leading-tight drop-shadow">
                  Сегодня было продуктивно! )
                </span>
              </div>

              {/* Vector Cat Mascot */}
              <svg
                width="140"
                height="125"
                viewBox="0 0 140 125"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
              >
                <defs>
                  {/* Cat Fur Gradient */}
                  <linearGradient id="catPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  {/* Inner Ear Gradient */}
                  <linearGradient id="catEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbcfe8" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>

                {/* Decorative Sparkles */}
                <g opacity="0.6">
                  <path
                    d="M15 35 C15 39 13 41 9 41 C13 41 15 43 15 47 C15 43 17 41 21 41 C17 41 15 39 15 35 Z"
                    fill="#38bdf8"
                  />
                  <path
                    d="M125 45 C125 49 123 51 119 51 C123 51 125 53 125 57 C125 53 127 51 131 51 C127 51 125 49 125 45 Z"
                    fill="#bef264"
                  />
                  <circle cx="24" cy="65" r="1.5" fill="#38bdf8" />
                  <circle cx="118" cy="20" r="1.5" fill="#bef264" />
                </g>

                {/* Left Ear */}
                <path
                  d="M40 60 L32 28 C30 24 35 20 40 24 L56 46 Z"
                  fill="url(#catPurpleGrad)"
                />
                <path d="M38 48 L35 32 L48 44 Z" fill="url(#catEarGrad)" />

                {/* Right Ear */}
                <path
                  d="M100 60 L108 28 C110 24 105 20 100 24 L84 46 Z"
                  fill="url(#catPurpleGrad)"
                />
                <path d="M102 48 L105 32 L92 44 Z" fill="url(#catEarGrad)" />

                {/* Cat Head */}
                <rect
                  x="30"
                  y="40"
                  width="80"
                  height="65"
                  rx="32"
                  fill="url(#catPurpleGrad)"
                />

                {/* Happy Closed Eyes (^ ^) */}
                <path
                  d="M48 68 Q54 62 60 68"
                  stroke="#1e1b4b"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M80 68 Q86 62 92 68"
                  stroke="#1e1b4b"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Cheeks Blush */}
                <ellipse cx="44" cy="74" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6" />
                <ellipse cx="96" cy="74" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6" />

                {/* Cat Nose & Mouth */}
                <polygon points="70,72 67,69 73,69" fill="#f43f5e" />
                <path
                  d="M64 76 Q67 79 70 76 Q73 79 76 76"
                  stroke="#1e1b4b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Whiskers */}
                <line x1="32" y1="71" x2="22" y2="69" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="32" y1="76" x2="20" y2="78" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="108" y1="71" x2="118" y2="69" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="108" y1="76" x2="120" y2="78" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. BOTTOM SECTION: ЦЕЛИ И УРОВНИ (3-BENTO COLUMNS)           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Bento Column 1: ЦЕЛИ И УРОВНИ (Intro & How it works) */}
        <div className="md:col-span-3 bg-[#0e214d] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#1d3570] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-[#142d69] border border-[#234594] flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <Target className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                ЦЕЛИ И УРОВНИ
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Двигайся к новым уровням, выполняй цели и открывай награды. Каждый уровень — это новые возможности и более сложные тексты.
              </p>
            </div>
          </div>

          <div className="pt-5">
            <button
              type="button"
              onClick={() => setIsHowItWorksOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#11295e] hover:bg-[#193a85] border border-blue-400/30 text-xs font-semibold text-blue-200 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Как это работает?</span>
            </button>
          </div>
        </div>

        {/* Bento Column 2: ТЕКУЩИЙ УРОВЕНЬ */}
        <div className="md:col-span-5 bg-[#0e214d] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#1d3570] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header: Level & Badge + Change Level Button */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">Текущий уровень</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8] text-[#38bdf8] text-xs font-black shadow-sm">
                    {currentLevel.level}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{currentLevel.name}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsLevelSelectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142d69] hover:bg-[#1f4091] border border-[#38bdf8]/40 text-xs font-bold text-sky-200 transition cursor-pointer shadow-sm hover:scale-102"
              >
                <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
                <span>Выбрать уровень</span>
              </button>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-[#0a1838] border border-[#1b3470] rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] to-[#818cf8] transition-all duration-700"
                    style={{ width: `${Math.max(wordsInLevel > 0 ? 3 : 0, levelProgressPercent)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-tight whitespace-nowrap">
                  <span className="text-[#38bdf8] font-black">{wordsInLevel}</span> / {levelSpan} слов
                </span>
              </div>

              {/* Next level remaining */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium pt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                <span>
                  {nextLevel ? (
                    <>
                      До следующего уровня ({nextLevel.level}):{" "}
                      <strong className="text-white font-bold">{wordsToNextLevel} слов</strong>
                    </>
                  ) : (
                    <strong className="text-[#bef264] font-bold">Вы достигли максимального уровня C2!</strong>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Row of CEFR Pills - now clickable to directly change level */}
          <div className="pt-4 border-t border-[#1a336e] mt-4">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
              <span>Шкала уровней CEFR (кликните, чтобы выбрать):</span>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {CEFR_LEVELS.map((lvl, idx) => {
                const isCompleted = idx < levelIndex;
                const isCurrent = idx === levelIndex;
                const isLocked = idx > levelIndex;

                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => handleSelectLevel(lvl.level)}
                    title={`Кликните, чтобы установить уровень ${lvl.level}: ${lvl.name} (${lvl.min}–${lvl.max} слов)`}
                    className={`flex items-center justify-center gap-0.5 py-2 px-0.5 rounded-xl text-[10px] sm:text-xs font-bold transition cursor-pointer select-none active:scale-95 ${
                      isCurrent
                        ? "bg-[#0284c7] text-white ring-2 ring-[#38bdf8] shadow-md shadow-sky-500/30 scale-105 font-black"
                        : isCompleted
                        ? "bg-[#14532d] text-[#86efac] border border-[#22c55e]/40 hover:bg-[#1b6b3b]"
                        : "bg-[#0b1b3f] text-slate-400 border border-[#1b3470] hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                    {isLocked && <Lock className="w-2.5 h-2.5 stroke-[2] opacity-60" />}
                    <span>{lvl.level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bento Column 3: ТВОИ ЦЕЛИ */}
        <div className="md:col-span-4 bg-[#0e214d] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#1d3570] flex flex-col justify-between">
          <div>
            {/* Header + Edit Button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                Твои цели
              </h3>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11295e] hover:bg-[#193a85] border border-slate-600/60 text-xs font-bold text-slate-200 transition cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-blue-300" />
                <span>Изменить цели</span>
              </button>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
              {/* Goal 1: Общая цель / ступень уровня */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#14532d] text-[#86efac] flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-200">
                      Цель уровня {currentLevel.level}: <strong className="text-white">{progressiveTargetWords.toLocaleString("ru-RU")}</strong> слов
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300 font-bold">
                    {learnedInAppWords.toLocaleString("ru-RU")}/{progressiveTargetWords.toLocaleString("ru-RU")}
                  </span>
                </div>
                <div className="h-2 bg-[#0a1838] border border-[#1b3470] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-[#4ade80] transition-all duration-500"
                    style={{ width: `${progressiveTargetPercent}%` }}
                  />
                </div>
              </div>

              {/* Goal 2: Дневная цель */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#1e293b] text-[#38bdf8] flex items-center justify-center shrink-0 border border-[#38bdf8]/30">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-200">
                      Добавлять <strong className="text-white">{goals.dailyGoal}</strong> слов в день
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300 font-bold">
                    {todayCount}/{goals.dailyGoal}
                  </span>
                </div>
                <div className="h-2 bg-[#0a1838] border border-[#1b3470] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] to-[#818cf8] transition-all duration-500"
                    style={{ width: `${dailyGoalPercent}%` }}
                  />
                </div>
              </div>

              {/* Goal 3: Недельная цель */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#713f12] text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                      <CalendarDays className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-200">
                      Цель на неделю: <strong className="text-white">{goals.weeklyGoal}</strong> слов/нед
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300 font-bold">
                    {weekCount}/{goals.weeklyGoal}
                  </span>
                </div>
                <div className="h-2 bg-[#0a1838] border border-[#1b3470] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#bef264] transition-all duration-500"
                    style={{ width: `${weeklyGoalPercent}%` }}
                  />
                </div>
              </div>

              {/* Bonus: Next Level Milestone */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-[#bef264]" />
                    <span>
                      {nextLevel ? `Достичь уровня ${nextLevel.level}` : "Максимальный уровень"}
                    </span>
                  </div>
                  <span className="font-bold text-white text-[11px]">
                    {currentLevel.level} → {nextLevel ? nextLevel.level : "C2"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              type="button"
              onClick={onSwitchToAddTab}
              className="w-full py-2.5 px-4 rounded-xl bg-[#bef264] hover:bg-[#aef037] active:scale-[0.98] text-slate-950 font-black text-xs tracking-tight uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Добавить слова сейчас</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MODAL: ИЗМЕНИТЬ ЦЕЛИ (User-requested options)              */}
      {/* ============================================================ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1a3d] text-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#1d3570] space-y-6">
            <div className="flex items-center justify-between border-b border-[#1b3470] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#bef264] text-slate-950 flex items-center justify-center font-black">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">Настройка целей</h3>
                  <p className="text-xs text-slate-300">Выберите подходящие ориентиры для темпа изучения</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Option 1: Общая цель */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Общая цель по словарному запасу:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TOTAL_GOAL_OPTIONS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTempGoals({ ...tempGoals, totalGoal: val })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                        tempGoals.totalGoal === val
                          ? "bg-[#bef264] text-slate-950 border-[#bef264] shadow-sm font-black"
                          : "bg-[#11295e] text-slate-200 border-[#1d3875] hover:bg-[#183980]"
                      }`}
                    >
                      {tempGoals.totalGoal === val && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{val.toLocaleString("ru-RU")}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Дневная цель с выбором и ручным вводом любого числа */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Дневная цель (слов в день):
                  </label>
                  <span className="text-xs font-bold text-[#38bdf8]">
                    {customDailyInput || tempGoals.dailyGoal} слов/день
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-3">
                  {DAILY_GOAL_OPTIONS.map((val) => {
                    const isSelected = parseInt(customDailyInput, 10) === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setTempGoals({ ...tempGoals, dailyGoal: val });
                          setCustomDailyInput(String(val));
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                          isSelected
                            ? "bg-[#38bdf8] text-slate-950 border-[#38bdf8] shadow-sm font-black"
                            : "bg-[#11295e] text-slate-200 border-[#1d3875] hover:bg-[#183980]"
                        }`}
                      >
                        <span>{val}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Number Input */}
                <div className="bg-[#0e214d] border border-[#1d3570] rounded-2xl p-3 flex items-center gap-3">
                  <div className="text-xs text-slate-300 whitespace-nowrap">Или введите своё число:</div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={customDailyInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomDailyInput(val);
                        const num = parseInt(val, 10);
                        if (!isNaN(num) && num > 0) {
                          setTempGoals({ ...tempGoals, dailyGoal: num });
                        }
                      }}
                      placeholder="Например, 15 или 25"
                      className="w-full bg-[#0a1838] border border-[#234594] rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#38bdf8] transition text-center"
                    />
                  </div>
                  <span className="text-xs text-slate-400">слов в день</span>
                </div>
              </div>

              {/* Option 3: Недельная цель */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Недельная цель (слов в неделю):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEEKLY_GOAL_OPTIONS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTempGoals({ ...tempGoals, weeklyGoal: val })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                        tempGoals.weeklyGoal === val
                          ? "bg-[#f472b6] text-slate-950 border-[#f472b6] shadow-sm font-black"
                          : "bg-[#11295e] text-slate-200 border-[#1d3875] hover:bg-[#183980]"
                      }`}
                    >
                      {tempGoals.weeklyGoal === val && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{val}/нед</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1b3470]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveGoals}
                className="px-5 py-2.5 rounded-xl bg-[#bef264] hover:bg-[#aef037] text-slate-950 font-black text-xs uppercase tracking-tight transition shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Сохранить цели</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: КАК ЭТО РАБОТАЕТ (CEFR Scale & Guidelines)          */}
      {/* ============================================================ */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1a3d] text-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#1d3570] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1b3470] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-black">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">Как работают уровни и цели?</h3>
                  <p className="text-xs text-slate-300">Шкала владения языком CEFR по словарному запасу</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Количество активных и пассивных слов — это главный фундамент беглости. Система рассчитывает твой уровень по количеству сохранённых и изучаемых карточек:
              </p>

              <div className="space-y-2 pt-1">
                {CEFR_LEVELS.map((lvl) => (
                  <div
                    key={lvl.level}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                      lvl.level === currentLevel.level
                        ? "bg-[#0c2e68] border-[#38bdf8] text-white"
                        : "bg-[#0e214d]/60 border-[#1d3570] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          lvl.level === currentLevel.level
                            ? "bg-[#38bdf8] text-slate-950 font-black"
                            : "bg-[#142d69] text-blue-300 border border-[#234594]"
                        }`}
                      >
                        {lvl.level}
                      </span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{lvl.name}</span>
                          {lvl.level === currentLevel.level && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30">
                              Твой уровень
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{lvl.description}</div>
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold text-right text-blue-200 whitespace-nowrap">
                      {lvl.min.toLocaleString("ru-RU")} – {lvl.max.toLocaleString("ru-RU")} слов
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#091733] border border-[#1d3570] text-xs text-slate-300 space-y-1.5 mt-3">
                <div className="font-bold text-[#bef264] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Совет по привычке:</span>
                </div>
                <p className="leading-relaxed">
                  Добавление даже <strong>10–30 слов в день</strong> благодаря интервальным повторениям Anki позволяет за год освоить свыше <strong>5 000–8 000 слов</strong> (уровень C1)!
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1b3470] flex justify-end">
              <button
                type="button"
                onClick={() => setIsHowItWorksOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#38bdf8] hover:bg-[#0284c7] text-slate-950 font-black text-xs uppercase tracking-tight transition cursor-pointer"
              >
                Понятно!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: ВЫБОР УРОВНЯ ВЛАДЕНИЯ АНГЛИЙСКИМ                     */}
      {/* ============================================================ */}
      {isLevelSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1a3d] text-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#1d3570] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1b3470] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-black">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">Выбрать уровень английского</h3>
                  <p className="text-xs text-slate-300">
                    Укажите ваш текущий уровень — верхняя планка цели автоматически адаптируется
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLevelSelectModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {CEFR_LEVELS.map((lvl) => {
                const isSelected = currentLevel.level === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => handleSelectLevel(lvl.level)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#0c2e68] border-[#38bdf8] text-white shadow-lg shadow-sky-950/50 ring-1 ring-[#38bdf8]"
                        : "bg-[#0e214d]/60 border-[#1d3570] text-slate-300 hover:bg-[#132b63] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#38bdf8] text-slate-950 font-black shadow-sm"
                            : "bg-[#142d69] text-blue-300 border border-[#234594]"
                        }`}
                      >
                        {lvl.level}
                      </span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{lvl.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#38bdf8] text-slate-950">
                              Выбран
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">{lvl.description}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-sky-200">
                        цель: {lvl.max.toLocaleString("ru-RU")} слов
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        диапазон {lvl.min}–{lvl.max}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#1b3470] flex justify-end">
              <button
                type="button"
                onClick={() => setIsLevelSelectModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
