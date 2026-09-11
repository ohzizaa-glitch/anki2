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
      className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[calc(100vw-1.5rem)] bg-slate-950/95 dark:bg-slate-950/95 text-white backdrop-blur-md p-1 sm:p-1.5 rounded-full shadow-2xl border border-slate-700/80 flex items-center justify-center gap-1 sm:gap-1.5 overflow-hidden select-none"
    >
      {/* 1. Добавить слово (бывшая непонятная кнопка Record) */}
      <button
        type="button"
        id="nav-tab-add"
        onClick={() => onSelectTab("add")}
        className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-black tracking-tight transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
          isAddActive
            ? "bg-[#bef264] text-slate-950 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <PlusCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Добавить</span>
      </button>

      {/* 2. Колоды (бывшая "Мои Decks") */}
      <button
        type="button"
        id="nav-tab-decks"
        onClick={() => onSelectTab("decks")}
        className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-black tracking-tight transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
          activeTab === "decks"
            ? "bg-white text-slate-950 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Layers className="w-3.5 h-3.5 shrink-0" />
        <span>Колоды</span>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
            activeTab === "decks"
              ? "bg-slate-900 text-white"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {cardsCount}
        </span>
      </button>

      {/* 3. Инструкция */}
      <button
        type="button"
        id="nav-tab-guide"
        onClick={() => onSelectTab("guide")}
        className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-black tracking-tight transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
          activeTab === "guide"
            ? "bg-[#bfdbfe] text-slate-950 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Инструкция</span>
      </button>

      {/* 4. Настройки (больше не вылазит за пределы за счет отсутствия scale-105 и правильных отступов) */}
      <button
        type="button"
        id="nav-tab-settings"
        onClick={() => onSelectTab("settings")}
        className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-black tracking-tight transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
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

