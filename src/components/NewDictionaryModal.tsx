import React, { useState } from "react";
import {
  X,
  BookOpen,
  Code,
  Plane,
  Briefcase,
  Sparkles,
  Coffee,
  Plus,
} from "lucide-react";
import { Dictionary } from "../types";

interface NewDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDictionary: (dict: Omit<Dictionary, "id" | "createdAt">) => void;
}

const AVAILABLE_ICONS = [
  { name: "BookOpen", label: "Книга", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Code", label: "IT / Код", icon: <Code className="w-4 h-4" /> },
  { name: "Plane", label: "Путешествия", icon: <Plane className="w-4 h-4" /> },
  { name: "Briefcase", label: "Бизнес", icon: <Briefcase className="w-4 h-4" /> },
  { name: "Sparkles", label: "Идиомы", icon: <Sparkles className="w-4 h-4" /> },
  { name: "Coffee", label: "Жизнь", icon: <Coffee className="w-4 h-4" /> },
];

export const NewDictionaryModal: React.FC<NewDictionaryModalProps> = ({
  isOpen,
  onClose,
  onCreateDictionary,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("BookOpen");
  const [selectedColor, setSelectedColor] = useState("indigo");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateDictionary({
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      isDefault: false,
    });

    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Новый тематический словарь
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Название темы / словаря:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="например: Финансы, Кулинария, Медицина..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Описание (необязательно):
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Кратко для чего этот словарь..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Иконка:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition ${
                    selectedIcon === item.name
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              Создать словарь
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
