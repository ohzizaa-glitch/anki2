import React, { useState, useEffect } from "react";
import {
  X,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Folder,
  Layers,
  HelpCircle,
} from "lucide-react";
import { AnkiSettings } from "../types";
import {
  getAnkiDecks,
  getAnkiModels,
  testAnkiConnection,
} from "../services/ankiConnect";

interface AnkiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AnkiSettings;
  onSaveSettings: (newSettings: AnkiSettings) => void;
  onOpenGuide: () => void;
}

export const AnkiSettingsModal: React.FC<AnkiSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenGuide,
}) => {
  const [formData, setFormData] = useState<AnkiSettings>(settings);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message?: string;
  }>({ tested: false, success: false });

  const [availableDecks, setAvailableDecks] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);

  useEffect(() => {
    setFormData(settings);
    setTestResult({ tested: false, success: false });
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({ tested: false, success: false });

    const result = await testAnkiConnection(formData);
    setIsTesting(false);

    if (result.connected) {
      setTestResult({
        tested: true,
        success: true,
        message: `Успешно подключено! AnkiConnect API v${result.version}`,
      });

      // Try fetching decks and models
      handleFetchDecks();
    } else {
      setTestResult({
        tested: true,
        success: false,
        message: result.error || "Не удалось связаться с AnkiConnect",
      });
    }
  };

  const handleFetchDecks = async () => {
    setIsLoadingDecks(true);
    try {
      const decks = await getAnkiDecks(formData);
      if (decks && decks.length > 0) {
        setAvailableDecks(decks);
      }
      const models = await getAnkiModels(formData);
      if (models && models.length > 0) {
        setAvailableModels(models);
      }
    } catch (err) {
      console.warn("Could not fetch decks/models", err);
    } finally {
      setIsLoadingDecks(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Настройки подключения к Anki
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* URL Input and Test */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>URL AnkiConnect:</span>
              <button
                type="button"
                onClick={onOpenGuide}
                className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" /> Инструкция по настройке
              </button>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="http://127.0.0.1:8765"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                <span>Проверить</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              По умолчанию: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">http://127.0.0.1:8765</code>. Для доступа со смартфона укажите IP компьютера в локальной сети.
            </p>
          </div>

          {/* Test connection result box */}
          {testResult.tested && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {testResult.success ? "Связь установлена" : "Нет подключения"}
                </p>
                <p className="text-[11px] mt-0.5">{testResult.message}</p>
                {!testResult.success && (
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="mt-1.5 underline font-semibold text-[11px] text-rose-700 dark:text-rose-400"
                  >
                    Посмотреть как настроить CORS в AnkiConnect →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Deck selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Колода по умолчанию в Anki:
              </label>
              <button
                type="button"
                onClick={handleFetchDecks}
                disabled={isLoadingDecks}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isLoadingDecks ? "Загружаем..." : "Обновить список колод"}
              </button>
            </div>

            {availableDecks.length > 0 ? (
              <select
                value={formData.deckName}
                onChange={(e) => setFormData({ ...formData, deckName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              >
                {availableDecks.map((deck) => (
                  <option key={deck} value={deck}>
                    {deck}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.deckName}
                onChange={(e) => setFormData({ ...formData, deckName: e.target.value })}
                placeholder="English::Vocabulary"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            )}
            <p className="text-[11px] text-slate-400">
              Если колода не существует в Anki, приложение автоматически создаст её.
            </p>
          </div>

          {/* Model / Note Type */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Тип карточки (Модель заметки):
            </label>
            {availableModels.length > 0 ? (
              <select
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                placeholder="Basic"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            )}
          </div>

          {/* Options */}
          <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoCreateDeck}
                onChange={(e) => setFormData({ ...formData, autoCreateDeck: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Автоматически создавать колоду в Anki, если она отсутствует
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useProxy}
                onChange={(e) => setFormData({ ...formData, useProxy: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Использовать серверный прокси (помогает при строгих политиках CORS браузера)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
          >
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
};
