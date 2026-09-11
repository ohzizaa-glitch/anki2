import React, { useState } from "react";
import {
  Settings,
  Laptop,
  Keyboard,
  Layers,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface InstructionBentoProps {
  onOpenSettings: () => void;
  onOpenGuideModal: () => void;
  ankiConnected: boolean | null;
}

export const InstructionBento: React.FC<InstructionBentoProps> = ({
  onOpenSettings,
  onOpenGuideModal,
  ankiConnected,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const addonId = "2055492159";

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addonId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
          КАК ПОЛЬЗОВАТЬСЯ
        </h3>
        <button
          type="button"
          onClick={onOpenGuideModal}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white underline inline-flex items-center gap-1"
        >
          <span>Полная инструкция</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Bento Cards (Matching the reference design) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Card 1: Lime */}
        <div
          onClick={onOpenGuideModal}
          className="bg-[#d9f99d] dark:bg-[#bef264]/20 border border-[#bef264] dark:border-[#bef264]/40 rounded-2xl p-3 sm:p-4 text-slate-900 dark:text-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition group min-h-[135px]"
        >
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-black tracking-tight uppercase text-slate-800 dark:text-slate-200 leading-tight block">
              1. УСТАНОВИТЬ ANKICONNECT
            </span>
          </div>

          <div className="flex items-center justify-center my-1 text-slate-900 dark:text-lime-300">
            <Settings className="w-7 h-7 sm:w-8 sm:h-8 group-hover:rotate-45 transition duration-300 stroke-[2.2]" />
          </div>

          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-900/10 dark:border-white/10">
            <div className="text-[10px] sm:text-[11px] font-mono font-bold leading-none">
              ADDON ID: <span className="underline">{addonId}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              title="Скопировать код дополнения"
              className="p-1 rounded-md bg-black/10 dark:bg-white/20 hover:bg-black/20 text-slate-900 dark:text-white transition"
            >
              {copiedId ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Card 2: Mint */}
        <div
          onClick={onOpenSettings}
          className="bg-[#a7f3d0] dark:bg-[#34d399]/20 border border-[#6ee7b7] dark:border-[#34d399]/40 rounded-2xl p-3 sm:p-4 text-slate-900 dark:text-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-md transition group min-h-[135px]"
        >
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-black tracking-tight uppercase text-slate-800 dark:text-slate-200 leading-tight block">
              2. ЗАПУСТИТЬ ANKI
            </span>
          </div>

          <div className="flex items-center justify-center my-1 text-slate-900 dark:text-emerald-300">
            <Laptop className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition duration-300 stroke-[2.2]" />
          </div>

          <div className="text-center pt-1 border-t border-slate-900/10 dark:border-white/10">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Держать Anki Desktop открытым
            </p>
          </div>
        </div>

        {/* Card 3: Pink */}
        <div className="bg-[#fbcfe8] dark:bg-[#f472b6]/20 border border-[#f472b6]/50 dark:border-[#f472b6]/40 rounded-2xl p-3 sm:p-4 text-slate-900 dark:text-slate-100 flex flex-col justify-between hover:shadow-md transition group min-h-[135px]">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-black tracking-tight uppercase text-slate-800 dark:text-slate-200 leading-tight block">
              3. ЗАПИСАТЬ СЛОВО
            </span>
          </div>

          <div className="flex items-center justify-center my-1 text-slate-900 dark:text-pink-300">
            <Keyboard className="w-7 h-7 sm:w-8 sm:h-8 group-hover:-translate-y-1 transition duration-300 stroke-[2.2]" />
          </div>

          <div className="text-center pt-1 border-t border-slate-900/10 dark:border-white/10">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Ввести английскую фразу и перевод
            </p>
          </div>
        </div>

        {/* Card 4: Soft Lavender / Blue */}
        <div className="bg-[#bfdbfe] dark:bg-[#60a5fa]/20 border border-[#93c5fd] dark:border-[#60a5fa]/40 rounded-2xl p-3 sm:p-4 text-slate-900 dark:text-slate-100 flex flex-col justify-between hover:shadow-md transition group min-h-[135px]">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-black tracking-tight uppercase text-slate-800 dark:text-slate-200 leading-tight block">
              4. ОДИН КЛИК И ГОТОВО
            </span>
          </div>

          <div className="flex items-center justify-center my-1 text-slate-900 dark:text-blue-300">
            <Layers className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition duration-300 stroke-[2.2]" />
          </div>

          <div className="text-center pt-1 border-t border-slate-900/10 dark:border-white/10">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
              Карточка создается автоматически!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
