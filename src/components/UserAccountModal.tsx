import React, { useState } from "react";
import { User } from "firebase/auth";
import {
  X,
  CheckCircle2,
  Cloud,
  LogOut,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { loginWithGoogle, logoutUser } from "../services/firebase";

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  cardsCount: number;
  unsyncedToAnkiCount: number;
  syncCode: string;
  onSetSyncCode: (code: string) => void;
  onDisconnectSync: () => void;
  onSyncLocalCardsToCloud?: () => Promise<void>;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  cardsCount,
  unsyncedToAnkiCount,
  syncCode,
  onSetSyncCode,
  onDisconnectSync,
  onSyncLocalCardsToCloud,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState(syncCode || "");
  const [isEditingCode, setIsEditingCode] = useState(!syncCode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const phoneSyncUrl = syncCode ? `${currentOrigin}/?sync=${syncCode}` : "";

  const handleCopyLink = async () => {
    if (!phoneSyncUrl) return;
    try {
      await navigator.clipboard.writeText(phoneSyncUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async () => {
    if (!syncCode) return;
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleApplyCode = () => {
    const cleaned = inputCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleaned) return;
    onSetSyncCode(cleaned);
    setIsEditingCode(false);
  };

  const handleGenerateNewCode = () => {
    const randomCode = `anki-${Math.floor(1000 + Math.random() * 9000)}`;
    setInputCode(randomCode);
    onSetSyncCode(randomCode);
    setIsEditingCode(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") return;
      setError(
        "Вход через Google недоступен в этом окружении. Пожалуйста, используйте Код синхронизации выше — он работает мгновенно и без ограничений!"
      );
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
                {syncCode ? `Подключено: ${syncCode}` : "Связка устройств по коду"}
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
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Primary Feature: SYNC CODE (Fast, No Google Login Issues) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/90 to-blue-50/50 dark:from-indigo-950/50 dark:to-slate-900/50 border border-indigo-200 dark:border-indigo-800/70 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  Ваш персональный код синхронизации:
                </span>
              </div>
              {syncCode && !isEditingCode && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Активен
                </span>
              )}
            </div>

            {syncCode && !isEditingCode ? (
              <div className="space-y-3">
                {/* Code display with copy */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-2 shadow-xs">
                  <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {syncCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-[10px] flex items-center gap-1 transition"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Скопирован</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Копировать код</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputCode(syncCode);
                        setIsEditingCode(true);
                      }}
                      className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium text-[10px] transition"
                    >
                      Изменить
                    </button>
                  </div>
                </div>

                {/* Direct link for phone button */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#bef264]" />
                      <span>Ссылка для телефона скопирована!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Скопировать прямую ссылку для телефона</span>
                    </>
                  )}
                </button>

                {/* How to use */}
                <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Как пользоваться:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      Откройте скопированную ссылку на телефоне (или введите код <strong>{syncCode}</strong>).
                    </li>
                    <li>
                      Добавляйте любые слова на телефоне в течение дня.
                    </li>
                    <li>
                      Дома откройте этот сайт на компьютере — все слова уже в списке. Нажмите <strong>«В Anki все»</strong>!
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              /* Setup or Enter Code Form */
              <div className="space-y-3">
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Введите любой код синхронизации (например, своё имя или слово) или сгенерируйте случайный:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="например: anki-2026"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCode}
                    disabled={!inputCode.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    Подключить
                  </button>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <button
                    type="button"
                    onClick={handleGenerateNewCode}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    🎲 Сгенерировать случайный код
                  </button>
                  {syncCode && (
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      className="hover:underline"
                    >
                      Отмена
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sync Stats & Controls */}
          {syncCode && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {cardsCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Карточек в словаре
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

              {/* Manual Cloud Refresh */}
              {onSyncLocalCardsToCloud && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Синхронизация..." : "Отправить текущие карточки в облако"}</span>
                </button>
              )}

              {/* Disconnect button */}
              <button
                type="button"
                onClick={() => {
                  onDisconnectSync();
                  setInputCode("");
                  setIsEditingCode(true);
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 text-xs font-medium transition"
              >
                Отключить этот код синхронизации
              </button>
            </div>
          )}

          {/* Optional: User Google Account Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-slate-900 dark:text-white">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-[10px] text-slate-400">Google аккаунт</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-500 text-[11px] font-bold hover:underline"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowGoogleLogin(!showGoogleLogin)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showGoogleLogin ? "▲ Скрыть вход Google" : "▼ Вход через Google (для персональных проектов)"}
                </button>
                {showGoogleLogin && (
                  <div className="mt-2 space-y-2">
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Внимание: в тестовой среде песочницы Google блокирует вход на системном домене. Код синхронизации выше работает автономно без этой проблемы.
                    </p>
                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <span>{isLoading ? "Подключение..." : "Попробовать войти через Google"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
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
