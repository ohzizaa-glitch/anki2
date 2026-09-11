import React, { useState } from "react";
import {
  X,
  UploadCloud,
  Check,
  Copy,
  ExternalLink,
  Code,
  Key,
  Layers,
  Sparkles,
} from "lucide-react";

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKeyName, setCopiedKeyName] = useState(false);

  if (!isOpen) return null;

  const handleCopyKeyName = () => {
    navigator.clipboard.writeText("GEMINI_API_KEY");
    setCopiedKeyName(true);
    setTimeout(() => setCopiedKeyName(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Деплой проекта на Vercel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Всё уже настроено: vercel.json и Serverless API готовы
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <div className="text-xs text-indigo-900 dark:text-indigo-300">
              В проект уже включены файлы конфигурации <code className="font-bold">vercel.json</code> и бессерверная функция <code className="font-bold">/api/translate.ts</code> для автоматического ИИ-перевода.
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Экспортируйте код в GitHub</span>
            </div>
            <p className="pl-7 text-xs text-slate-500 dark:text-slate-400">
              В меню настроек Google AI Studio (справа вверху) выберите <strong>Export to GitHub</strong> или скачайте ZIP-архив проекта и загрузите его в свой репозиторий GitHub.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Импортируйте проект на Vercel</span>
            </div>
            <p className="pl-7 text-xs text-slate-500 dark:text-slate-400">
              Перейдите на{" "}
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline font-semibold inline-flex items-center gap-0.5"
              >
                vercel.com/new <ExternalLink className="w-3 h-3" />
              </a>
              , выберите ваш репозиторий и нажмите <strong>Import</strong>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Укажите переменную окружения (Ключ Gemini API)</span>
            </div>
            <div className="pl-7 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                В секции <strong>Environment Variables</strong> на Vercel добавьте:
              </p>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Имя переменной (Key)
                  </div>
                  <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    GEMINI_API_KEY
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyKeyName}
                  className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-xs"
                >
                  {copiedKeyName ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKeyName ? "Скопировано" : "Копировать"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Значение переменной (Value) — ваш ключ из Google AI Studio или Google Cloud.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs flex items-center justify-center font-bold">
                4
              </span>
              <span>Нажмите «Deploy»</span>
            </div>
            <p className="pl-7 text-xs text-slate-500 dark:text-slate-400">
              Vercel автоматически скомпилирует приложение через Vite и запустит бессерверный API. Вы получите собственный публичный домен вида <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">your-app.vercel.app</code> с поддержкой HTTPS и мобильных устройств!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white hover:underline"
          >
            <span>Открыть Vercel Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition shadow-sm"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
