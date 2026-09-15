import React from "react";
import {
  PlusCircle,
  Layers,
  HelpCircle,
  Settings,
} from "lucide-react";

export type NavTab = "add" | "decks" | "guide" | "settings" | "record";

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
      className="fixed bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-1rem)] max-w-md sm:w-auto bg-slate-950/95 dark:bg-slate-950/95 text-white backdrop-blur-md p-1 sm:p-1.5 rounded-full shadow-2xl border border-slate-700/80 flex items-center justify-between sm:justify-center gap-0.5 sm:gap-1.5 select-none"
    >
      {/* 1. Добавить слово */}
      <button
        type="button"
        id="nav-tab-add"
        onClick={() => onSelectTab("add")}
        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-colors duration-150 whitespace-nowrap cursor-pointer ${
          isAddActive
            ? "bg-[#bef264] text-slate-950 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <PlusCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Добавить</span>
      </button>

      {/* 2. Колоды */}
      <button
        type="button"
        id="nav-tab-decks"
        onClick={() => onSelectTab("decks")}
        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-colors duration-150 whitespace-nowrap cursor-pointer ${
          activeTab === "decks"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Layers className="w-3.5 h-3.5 shrink-0" />
        <span>Колоды</span>
        <span
          className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.2 rounded-full ${
            activeTab === "decks"
              ? "bg-slate-900 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {cardsCount}
        </span>
      </button>

      {/* 3. Инструкция (на узких мобильных экранах отображается как «Инфо») */}
      <button
        type="button"
        id="nav-tab-guide"
        onClick={() => onSelectTab("guide")}
        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-colors duration-150 whitespace-nowrap cursor-pointer ${
          activeTab === "guide"
            ? "bg-[#bfdbfe] text-slate-950 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        <span className="inline sm:hidden">Инфо</span>
        <span className="hidden sm:inline">Инструкция</span>
      </button>

      {/* 4. Настройки */}
      <button
        type="button"
        id="nav-tab-settings"
        onClick={() => onSelectTab("settings")}
        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black tracking-tight transition-colors duration-150 whitespace-nowrap cursor-pointer ${
          activeTab === "settings"
            ? "bg-[#fbcfe8] text-slate-950 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Settings className="w-3.5 h-3.5 shrink-0" />
        <span>Настройки</span>
      </button>
    </nav>
  );
};

