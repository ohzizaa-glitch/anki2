import React, { useState } from "react";
import {
  X,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Laptop,
  Sparkles,
  Download,
  Send,
  Zap,
} from "lucide-react";

interface AnkiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const AnkiGuideModal: React.FC<AnkiGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const pluginCode = "2055492159";
  const ankiConfigSample = `{
  "apiKey": null,
  "apiLogPath": null,
  "ignoreOriginList": [],
  "webBindAddress": "0.0.0.0",
  "webBindPort": 8765,
  "webCorsOriginList": ["*"]
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pluginCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(ankiConfigSample);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Инструкция по настройке Anki & AnkiConnect
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Как автоматизировать создание карточек за 2 минуты
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Установите плагин AnkiConnect в Anki
              </h4>
            </div>
            <div className="pl-8 space-y-2 text-slate-600 dark:text-slate-300">
              <p>
                Запустите программу Anki на компьютере. В верхнем меню выберите:
                <br />
                <strong className="text-slate-900 dark:text-white">
                  Инструменты → Дополнения → Загрузить дополнения
                </strong>{" "}
                (Tools → Add-ons → Get Add-ons).
              </p>
              <div className="flex items-center gap-2">
                <span>Код плагина AnkiConnect:</span>
                <code className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono font-bold rounded-md">
                  {pluginCode}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md font-medium transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Скопировано" : "Копировать"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                После установки обязательно перезапустите приложение Anki.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Настройте CORS в AnkiConnect (Важно для браузера)
              </h4>
            </div>
            <div className="pl-8 space-y-2 text-slate-600 dark:text-slate-300">
              <p>
                Браузер требует разрешения для связи с Anki. В Anki перейдите:
                <br />
                <strong className="text-slate-900 dark:text-white">
                  Инструменты → Дополнения → выберите AnkiConnect → Настройки (Config)
                </strong>
                .
              </p>
              <p>
                Замените содержимое окна настроек на следующий JSON (он разрешает веб-подключение) и нажмите{" "}
                <strong className="text-slate-900 dark:text-white">OK</strong>:
              </p>

              <div className="relative">
                <pre className="p-3 bg-slate-900 text-slate-100 dark:bg-slate-950 font-mono text-[11px] sm:text-xs rounded-xl overflow-x-auto border border-slate-800">
                  {ankiConfigSample}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyConfig}
                  className="absolute top-2 right-2 inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition cursor-pointer"
                >
                  {copiedConfig ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedConfig ? "Скопировано!" : "Скопировать конфиг"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                После сохранения конфигурации перезапустите Anki.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Работа через Vercel (HTTPS)
              </h4>
            </div>
            <div className="pl-8 space-y-2 text-slate-600 dark:text-slate-300">
              <p>
                Если вы открыли сайт на Vercel (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">https://...vercel.app</code>), современные браузеры по умолчанию блокируют обращение защищенного сайта к локальному Anki на вашем компьютере (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">http://127.0.0.1:8765</code>).
              </p>
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-900/60 space-y-1.5 text-xs">
                <div className="font-semibold text-indigo-950 dark:text-indigo-200">
                  Как разрешить браузеру передавать карточки в Anki:
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Нажмите на значок замочка / настроек сайта слева от адреса в строке браузера.</li>
                  <li>Выберите <strong>«Настройки сайтов» (Site settings)</strong>.</li>
                  <li>Найдите параметр <strong>«Небезопасный контент» (Insecure content)</strong> и переключите на <strong>«Разрешить» (Allow)</strong>.</li>
                  <li>Обновите страницу — теперь слова будут добавляться напрямую в Anki!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Использование с телефона (Смартфон / Мобильный доступ)
              </h4>
            </div>
            <div className="pl-8 space-y-2 text-slate-600 dark:text-slate-300">
              <p>
                Сайт полностью оптимизирован для мобильных телефонов (iOS Safari и Android Chrome):
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Синхронизация через CSV:</strong> Создавайте и сохраняйте слова на смартфоне в любое время. Когда будете за ПК, нажмите{" "}
                  <strong>«Экспорт CSV»</strong> или <strong>«Для Anki (.txt)»</strong> и загрузите их в Anki через <em>Файл → Импорт</em>.
                </li>
                <li>
                  <strong>Прямое добавление по Wi-Fi:</strong> Если ваш телефон и компьютер подключены к одной Wi-Fi сети, откройте{" "}
                  <strong>Настройки Anki</strong> в приложении и укажите локальный IP вашего компьютера (например:{" "}
                  <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">http://192.168.1.50:8765</code>). Карточки с телефона будут мгновенно создаваться в Anki на вашем ПК!
                </li>
              </ul>
            </div>
          </div>

          {/* Step 5 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                5
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Быстрые клавиши
              </h4>
            </div>
            <div className="pl-8 space-y-1.5 text-slate-600 dark:text-slate-300">
              <p>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded font-mono text-xs">
                  Enter
                </kbd>{" "}
                — мгновенный ИИ-перевод введенного слова.
              </p>
              <p>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded font-mono text-xs">
                  Ctrl + Enter
                </kbd>{" "}
                (или <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded font-mono text-xs">Cmd + Enter</kbd>) — мгновенная отправка готовой карточки в Anki за 1 секунду!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Открыть настройки подключения</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
          >
            Всё понятно
          </button>
        </div>
      </div>
    </div>
  );
};
