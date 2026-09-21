import React from "react";
import {
  PlusCircle,
  Target,
  Layers,
  HelpCircle,
  Settings,
} from "lucide-react";

export type NavTab = "add" | "goals" | "decks" | "guide" | "settings" | "record";

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  cardsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  cardsCount,
}) => {
  const isAddActive = activeTab === "add" || activeTab === "record";

  return (
    <nav
      id="bottom-nav-bar"
      className="fixed bottom-3 sm:bottom-4.5 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)] bg-slate-950/95 dark:bg-slate-950/95 text-white backdrop-blur-md p-1 sm:p-1.5 rounded-full shadow-2xl border border-slate-700/80 flex items-center justify-center gap-0.5 sm:gap-1.5 select-none"
    >
      {/* 1. Добавить слово */}
      <button
        type="button"
        id="nav-tab-add"
        onClick={() => onSelectTab("add")}
        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 xs:px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 ${
          isAddActive
            ? "bg-[#bef264] text-slate-950 shadow-sm scale-102"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <PlusCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Добавить</span>
      </button>

      {/* 2. Цели и прогресс */}
      <button
        type="button"
        id="nav-tab-goals"
        onClick={() => onSelectTab("goals")}
        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 xs:px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 ${
          activeTab === "goals"
            ? "bg-[#38bdf8] text-slate-950 shadow-sm scale-102"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Target className="w-3.5 h-3.5 shrink-0" />
        <span>Цели</span>
      </button>

      {/* 3. Колоды */}
      <button
        type="button"
        id="nav-tab-decks"
        onClick={() => onSelectTab("decks")}
        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 xs:px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 ${
          activeTab === "decks"
            ? "bg-white text-slate-950 shadow-sm scale-102"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Layers className="w-3.5 h-3.5 shrink-0" />
        <span>Колоды</span>
        <span
          className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full ${
            activeTab === "decks"
              ? "bg-slate-900 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {cardsCount}
        </span>
      </button>

      {/* 4. Инструкция / Гайд */}
      <button
        type="button"
        id="nav-tab-guide"
        onClick={() => onSelectTab("guide")}
        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 xs:px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 ${
          activeTab === "guide"
            ? "bg-[#bfdbfe] text-slate-950 shadow-sm scale-102"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        <span className="inline md:hidden">Гайд</span>
        <span className="hidden md:inline">Инструкция</span>
      </button>

      {/* 5. Настройки */}
      <button
        type="button"
        id="nav-tab-settings"
        onClick={() => onSelectTab("settings")}
        className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 xs:px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 ${
          activeTab === "settings"
            ? "bg-[#fbcfe8] text-slate-950 shadow-sm scale-102"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Settings className="w-3.5 h-3.5 shrink-0" />
        <span>Настройки</span>
      </button>
    </nav>
  );
};

