import React, { useState } from "react";
import { User } from "firebase/auth";
import {
  X,
  Smartphone,
  Laptop,
  CheckCircle2,
  Cloud,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { loginWithGoogle, logoutUser } from "../services/firebase";

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  cardsCount: number;
  unsyncedToAnkiCount: number;
  onSyncLocalCardsToCloud?: () => Promise<void>;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  cardsCount,
  unsyncedToAnkiCount,
  onSyncLocalCardsToCloud,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Не удалось войти через Google. Попробуйте еще раз.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка при выходе");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!onSyncLocalCardsToCloud) return;
    setIsSyncing(true);
    try {
      await onSyncLocalCardsToCloud();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Синхронизация с телефоном
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {user ? "Облачный аккаунт подключен" : "Вход через Google"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {user ? (
            /* Logged-in state */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border border-emerald-300 dark:border-emerald-700 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-base">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {user.displayName || "Пользователь"}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Облачная синхронизация активна
                  </span>
                </div>
              </div>

              {/* Stats & status */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {cardsCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Карточек в облаке
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {unsyncedToAnkiCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ждут отправки в Anki
                  </div>
                </div>
              </div>

              {/* Manual upload button */}
              {onSyncLocalCardsToCloud && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Синхронизация..." : "Обновить синхронизацию с облаком"}</span>
                </button>
              )}

              {/* Sign out button */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          ) : (
            /* Not logged-in state */
            <div className="space-y-4">
              {/* Feature highlight */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Как работает добавление с телефона:</span>
                </div>
                <div className="space-y-2 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Войдите через Google на <strong>телефоне</strong> и на <strong>компьютере</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Добавляйте слова с телефона в течение дня (на прогулке, при чтении, в транспорте).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Дома откройте сайт на компьютере — все слова уже тут! Нажмите <strong>«В Anki все»</strong>, и они за секунду добавятся в десктопный Anki.</span>
                  </div>
                </div>
              </div>

              {/* Login button */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 transition cursor-pointer disabled:opacity-60"
              >
                {/* Google Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? "Подключение..." : "Войти через Google"}</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Полностью бесплатно. Ваши слова защищены вашим Google аккаунтом.</span>
              </div>
            </div>
          )}

          {/* Visual Device Bridge Diagram */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Телефон
              </span>
              <span className="text-[9px] text-slate-400">Ввод слов</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-4 h-0.5 bg-slate-300 dark:bg-slate-700" />
              <Cloud className="w-4 h-4 text-indigo-500 animate-pulse" />
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Laptop className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Компьютер
              </span>
              <span className="text-[9px] text-slate-400">Экспорт в Anki</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
