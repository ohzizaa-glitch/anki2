import React from "react";
import { User } from "firebase/auth";
import {
  Sparkles,
  HelpCircle,
  Settings,
  Sun,
  Moon,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Layers,
  Flame,
  Cloud,
} from "lucide-react";
import { ThemeMode } from "../types";

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  ankiConnected: boolean | null;
  ankiVersion?: number;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenVercel: () => void;
  onOpenReview: () => void;
  reviewCount: number;
  user: User | null;
  onOpenAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  ankiConnected,
  ankiVersion,
  onOpenSettings,
  onOpenGuide,
  onOpenVercel,
  onOpenReview,
  reviewCount,
  user,
  onOpenAccount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0a1836]/90 backdrop-blur-md border-b border-[#1b3166] text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#bef264] flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-[#bef264]/20 transform -rotate-3 hover:rotate-0 transition">
            LS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase text-white">
                LexiSync <span className="text-[#bef264]">Anki</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#bef264]/20 text-[#bef264] border border-[#bef264]/40">
                <Sparkles className="w-3 h-3 text-[#bef264]" /> AI + Connect
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Умный генератор карточек для Anki с автопереводом
            </p>
          </div>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2">
          {/* Anki Connection Pill */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={
              ankiConnected
                ? `Anki подключен (версия ${ankiVersion || 6}). Порт 8765.`
                : "AnkiConnect не отвечает. Нажмите для настройки."
            }
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
              ankiConnected === true
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                : ankiConnected === false
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {ankiConnected === true ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Anki: Онлайн</span>
              </>
            ) : ankiConnected === false ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Anki: Оффлайн</span>
              </>
            ) : (
              <span>Проверка...</span>
            )}
          </button>

          {/* Flashcard Review Pill Button */}
          {reviewCount > 0 && (
            <button
              type="button"
              onClick={onOpenReview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#fbcfe8] hover:bg-[#f472b6] text-slate-950 transition shadow-sm cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Повторение ({reviewCount})</span>
            </button>
          )}

          {/* Cloud Account / Device Sync Button */}
          {user ? (
            <button
              type="button"
              onClick={onOpenAccount}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition border border-white/15 cursor-pointer"
              title={`Облако: ${user.email}. Синхронизация между телефоном и ПК активна.`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover border border-[#bef264]"
                />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-[#bef264]" />
              )}
              <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                {user.displayName || "Облако"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAccount}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#bef264] hover:bg-[#a3e635] text-slate-950 transition shadow-sm cursor-pointer"
              title="Войти через Google для синхронизации с телефоном"
            >
              <Cloud className="w-3.5 h-3.5 shrink-0" />
              <span>Войти</span>
            </button>
          )}

          {/* Vercel Deploy Modal Trigger */}
          <button
            type="button"
            onClick={onOpenVercel}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Инструкция по развертыванию на Vercel"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#bef264]" />
            <span>Vercel</span>
          </button>

          {/* Guide Modal Trigger */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Инструкция по использованию"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings Modal Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Настройки Anki"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            title={theme === "dark" ? "Переключить на светлую тему" : "Переключить на темную тему"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
