import React, { useState, useEffect, useCallback } from "react";
import {
  loadStoredCards,
  saveStoredCards,
  loadStoredDictionaries,
  saveStoredDictionaries,
  loadStoredAnkiSettings,
  saveStoredAnkiSettings,
  exportCardsToCsv,
  exportAnkiTsv,
  parseCardsFromCsv,
} from "./services/storage";
import {
  addCardToAnki,
  testAnkiConnection,
} from "./services/ankiConnect";
import { AnkiSettings, Dictionary, ThemeMode, WordCard } from "./types";
import { User } from "firebase/auth";
import {
  onAuthChange,
  subscribeToCloudCards,
  subscribeToCloudDictionaries,
  saveCardToCloud,
  deleteCardFromCloud,
  saveDictionaryToCloud,
  deleteDictionaryFromCloud,
  uploadLocalDataToCloud,
} from "./services/firebase";
import { Header } from "./components/Header";
import { WordInputForm } from "./components/WordInputForm";
import { RightDecksPanel } from "./components/RightDecksPanel";
import { BottomNavBar, NavTab } from "./components/BottomNavBar";
import { ReviewModal } from "./components/ReviewModal";
import { AnkiGuideModal } from "./components/AnkiGuideModal";
import { AnkiSettingsModal } from "./components/AnkiSettingsModal";
import { VercelDeployModal } from "./components/VercelDeployModal";
import { NewDictionaryModal } from "./components/NewDictionaryModal";
import { UserAccountModal } from "./components/UserAccountModal";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Columns,
  Maximize2,
  Smartphone,
  Cloud,
} from "lucide-react";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("anki_app_theme_v1");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Navigation tab state (Add / Decks / Guide / Settings)
  const [activeTab, setActiveTab] = useState<NavTab>("add");

  // Core Data
  const [cards, setCards] = useState<WordCard[]>(() => loadStoredCards());
  const [dictionaries, setDictionaries] = useState<Dictionary[]>(() => loadStoredDictionaries());
  const [activeDictionaryId, setActiveDictionaryId] = useState<string>("all");
  const [ankiSettings, setAnkiSettings] = useState<AnkiSettings>(() => loadStoredAnkiSettings());

  // Anki Connection Status
  const [ankiConnected, setAnkiConnected] = useState<boolean | null>(null);
  const [ankiVersion, setAnkiVersion] = useState<number | undefined>(undefined);

  // User Authentication & Cloud Sync
  const [user, setUser] = useState<User | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isVercelOpen, setIsVercelOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isNewDictOpen, setIsNewDictOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3800);
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsub = onAuthChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        showToast(`Вход выполнен: ${currentUser.displayName || currentUser.email}`, "success");
      }
    });
    return () => unsub();
  }, [showToast]);

  // Real-time Firestore sync when user is authenticated
  useEffect(() => {
    if (!user) return;

    // 1. Subscribe to cards in cloud
    const unsubCards = subscribeToCloudCards(
      user.uid,
      (cloudCards) => {
        if (cloudCards.length > 0) {
          setCards(cloudCards);
        } else {
          // If cloud has 0 cards but user has local cards, auto-upload to cloud!
          const local = loadStoredCards();
          const localDicts = loadStoredDictionaries();
          if (local.length > 0) {
            uploadLocalDataToCloud(user.uid, local, localDicts);
          }
        }
      },
      (err) => console.warn("Cloud cards sync error:", err)
    );

    // 2. Subscribe to dictionaries in cloud
    const unsubDicts = subscribeToCloudDictionaries(
      user.uid,
      (cloudDicts) => {
        if (cloudDicts.length > 0) {
          setDictionaries(cloudDicts);
        }
      },
      (err) => console.warn("Cloud dicts sync error:", err)
    );

    return () => {
      unsubCards();
      unsubDicts();
    };
  }, [user]);

  const handleManualSyncToCloud = async () => {
    if (!user) return;
    await uploadLocalDataToCloud(user.uid, cards, dictionaries);
    showToast("Все карточки и колоды синхронизированы с облаком!", "success");
  };

  // Sync theme with HTML root class
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("anki_app_theme_v1", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Check Anki Connection on mount and when settings change
  const checkConnection = useCallback(async () => {
    try {
      const res = await testAnkiConnection(ankiSettings);
      setAnkiConnected(res.connected);
      if (res.connected) {
        setAnkiVersion(res.version);
      }
    } catch {
      setAnkiConnected(false);
    }
  }, [ankiSettings]);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 25000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Persist cards
  useEffect(() => {
    saveStoredCards(cards);
  }, [cards]);

  // Persist dictionaries
  useEffect(() => {
    saveStoredDictionaries(dictionaries);
  }, [dictionaries]);

  // Handle Tab Selection
  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === "guide") {
      setIsGuideOpen(true);
    } else if (tab === "settings") {
      setIsSettingsOpen(true);
    }
  };

  // Handle Add Card
  const handleAddCard = async (
    cardData: Omit<WordCard, "id" | "createdAt">,
    syncToAnkiImmediately: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const newCard: WordCard = {
      ...cardData,
      id: "card_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
      timesReviewed: 0,
      isMastered: false,
      ankiStatus: "not_added",
    };

    const dict = dictionaries.find((d) => d.id === newCard.dictionaryId);

    if (syncToAnkiImmediately) {
      try {
        const { noteId } = await addCardToAnki(ankiSettings, newCard, dict?.name);
        newCard.ankiStatus = "synced";
        newCard.ankiNoteId = noteId;
        setCards((prev) => [newCard, ...prev]);
        if (user) {
          saveCardToCloud(user.uid, newCard).catch((e) => console.warn("Cloud save error:", e));
        }
        setAnkiConnected(true);
        showToast(`Карточка "${newCard.original}" создана и добавлена в Anki! ⚡`, "success");
        return { success: true };
      } catch (err: any) {
        console.warn("Anki direct sync failed:", err.message);
        newCard.ankiStatus = "error";
        newCard.ankiError = err.message;
        setCards((prev) => [newCard, ...prev]);
        if (user) {
          saveCardToCloud(user.uid, newCard).catch((e) => console.warn("Cloud save error:", e));
        }
        showToast(
          `Слово сохранено в словарь, но не передано в Anki (${err.message})`,
          "error"
        );
        return { success: true, error: err.message };
      }
    } else {
      setCards((prev) => [newCard, ...prev]);
      if (user) {
        saveCardToCloud(user.uid, newCard).catch((e) => console.warn("Cloud save error:", e));
      }
      showToast(`Слово "${newCard.original}" сохранено в словарь`, "success");
      return { success: true };
    }
  };

  // Sync single card to Anki
  const handleSyncSingleCard = async (card: WordCard): Promise<{ success: boolean; error?: string }> => {
    const dict = dictionaries.find((d) => d.id === card.dictionaryId);
    try {
      const { noteId } = await addCardToAnki(ankiSettings, card, dict?.name);
      const updatedCard = { ...card, ankiStatus: "synced" as const, ankiNoteId: noteId, ankiError: undefined };
      setCards((prev) =>
        prev.map((c) =>
          c.id === card.id ? updatedCard : c
        )
      );
      if (user) {
        saveCardToCloud(user.uid, updatedCard).catch((e) => console.warn("Cloud sync update error:", e));
      }
      setAnkiConnected(true);
      showToast(`Карточка "${card.original}" отправлена в Anki!`, "success");
      return { success: true };
    } catch (err: any) {
      const errCard = { ...card, ankiStatus: "error" as const, ankiError: err.message };
      setCards((prev) =>
        prev.map((c) =>
          c.id === card.id ? errCard : c
        )
      );
      if (user) {
        saveCardToCloud(user.uid, errCard).catch((e) => console.warn("Cloud sync update error:", e));
      }
      showToast(`Не удалось отправить в Anki: ${err.message}`, "error");
      return { success: false, error: err.message };
    }
  };

  // Sync all unsynced cards
  const handleSyncAllCards = async () => {
    const unsynced = cards.filter((c) => c.ankiStatus !== "synced");
    if (unsynced.length === 0) {
      showToast("Все карточки уже синхронизированы с Anki", "info");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const card of unsynced) {
      const dict = dictionaries.find((d) => d.id === card.dictionaryId);
      try {
        const { noteId } = await addCardToAnki(ankiSettings, card, dict?.name);
        const updatedCard = { ...card, ankiStatus: "synced" as const, ankiNoteId: noteId, ankiError: undefined };
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id ? updatedCard : c
          )
        );
        if (user) {
          saveCardToCloud(user.uid, updatedCard).catch((e) => console.warn("Cloud sync update error:", e));
        }
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      setAnkiConnected(true);
      showToast(`Отправлено в Anki: ${successCount} карточек!`, "success");
    }
    if (failCount > 0) {
      showToast(`Не удалось отправить: ${failCount} карточек (проверьте Anki)`, "error");
    }
  };

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    if (user) {
      deleteCardFromCloud(user.uid, cardId).catch((e) => console.warn("Cloud delete error:", e));
    }
    showToast("Карточка удалена", "info");
  };

  // Create Dictionary
  const handleCreateDictionary = (dictData: Omit<Dictionary, "id" | "createdAt">) => {
    const newDict: Dictionary = {
      ...dictData,
      id: "dict_" + Date.now(),
      createdAt: Date.now(),
    };
    setDictionaries((prev) => [...prev, newDict]);
    setActiveDictionaryId(newDict.id);
    if (user) {
      saveDictionaryToCloud(user.uid, newDict).catch((e) => console.warn("Cloud save dict error:", e));
    }
    showToast(`Колода "${newDict.name}" создана`, "success");
  };

  // Delete Dictionary
  const handleDeleteDictionary = (dictId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.dictionaryId === dictId ? { ...c, dictionaryId: "dict_general" } : c))
    );
    setDictionaries((prev) => prev.filter((d) => d.id !== dictId));
    if (activeDictionaryId === dictId) {
      setActiveDictionaryId("all");
    }
    if (user) {
      deleteDictionaryFromCloud(user.uid, dictId).catch((e) => console.warn("Cloud delete dict error:", e));
    }
    showToast("Колода удалена. Карточки перемещены в общий словарь", "info");
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AnkiSettings) => {
    setAnkiSettings(newSettings);
    saveStoredAnkiSettings(newSettings);
    showToast("Настройки Anki сохранены", "success");
    checkConnection();
  };

  // Update card review statistics
  const handleUpdateCardReview = (cardId: string, remembered: boolean) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            timesReviewed: (c.timesReviewed || 0) + 1,
            lastReviewedAt: Date.now(),
            isMastered: remembered ? true : c.isMastered,
          };
        }
        return c;
      })
    );
  };

  // CSV Exports
  const handleExportCsv = () => {
    exportCardsToCsv(cards, dictionaries);
    showToast(`Бэкап: экспортировано ${cards.length} карточек в CSV файл`, "success");
  };

  const handleExportAnkiTsv = () => {
    exportAnkiTsv(cards, dictionaries);
    showToast(`Файл для импорта в Anki (.txt) скачан`, "success");
  };

  // CSV Import
  const handleImportCsv = (csvText: string) => {
    try {
      const parsed = parseCardsFromCsv(csvText, activeDictionaryId === "all" ? "dict_general" : activeDictionaryId);
      if (parsed.length === 0) {
        showToast("Не удалось извлечь карточки из выбранного CSV файла", "error");
        return;
      }
      setCards((prev) => [...(parsed as WordCard[]), ...prev]);
      showToast(`Успешно импортировано ${parsed.length} карточек!`, "success");
    } catch {
      showToast("Ошибка чтения CSV файла", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#07132c] text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#bef264] selection:text-slate-950 pb-24 sm:pb-28 lg:pb-28">
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        ankiConnected={ankiConnected}
        ankiVersion={ankiVersion}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenVercel={() => setIsVercelOpen(true)}
        onOpenReview={() => setIsReviewOpen(true)}
        reviewCount={cards.length}
        user={user}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Responsive Layout:
            - On lg screens: Side-by-side Dual Panel matching the reference image!
            - On smaller screens: Tabbed switching between Left (Add) and Right (Decks/Guide/Cards)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: LEXISYNC ДОБАВЛЕНИЕ СЛОВ */}
          <div
            className={`lg:col-span-5 ${
              activeTab === "add" || activeTab === "record" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Cloud Sync Status / Quick Bridge Notice */}
            {!user ? (
              <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-blue-950/70 border border-indigo-500/30 text-white shadow-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Синхронизация с телефоном</span>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-[#bef264]/20 text-[#bef264] rounded-sm font-black border border-[#bef264]/30">
                        FREE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      Добавляйте слова на телефоне — дома скидывайте в Anki!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#bef264] hover:bg-[#a3e635] text-slate-950 font-black text-xs shrink-0 transition shadow-sm cursor-pointer"
                >
                  Войти
                </button>
              </div>
            ) : (
              <div className="mb-4 px-3.5 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[11px] font-medium truncate">
                    Синхронизация активна • <strong>{cards.length}</strong> карточек в облаке
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(true)}
                  className="text-[11px] font-bold text-[#bef264] hover:underline shrink-0"
                >
                  Аккаунт
                </button>
              </div>
            )}

            <WordInputForm
              dictionaries={dictionaries}
              activeDictionaryId={activeDictionaryId === "all" ? dictionaries[0]?.id || "dict_general" : activeDictionaryId}
              onSelectDictionary={(id) => setActiveDictionaryId(id)}
              onOpenNewDictModal={() => setIsNewDictOpen(true)}
              onAddCard={handleAddCard}
              ankiConnected={ankiConnected}
              onOpenGuide={() => setIsGuideOpen(true)}
            />
          </div>

          {/* Right Panel: МОИ СЛОВАРИ И ИНСТРУКЦИЯ */}
          <div
            className={`lg:col-span-7 ${
              activeTab === "decks" || activeTab === "guide" || activeTab === "settings"
                ? "block"
                : "hidden lg:block"
            }`}
          >
            <RightDecksPanel
              dictionaries={dictionaries}
              activeDictionaryId={activeDictionaryId}
              onSelectDictionary={(id) => setActiveDictionaryId(id)}
              onOpenNewDictModal={() => setIsNewDictOpen(true)}
              onDeleteDictionary={handleDeleteDictionary}
              cards={cards}
              onDeleteCard={handleDeleteCard}
              onSyncSingleCard={handleSyncSingleCard}
              onSyncAllCards={handleSyncAllCards}
              onExportCsv={handleExportCsv}
              onExportAnkiTsv={handleExportAnkiTsv}
              onImportCsv={handleImportCsv}
              ankiConnected={ankiConnected}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenGuideModal={() => setIsGuideOpen(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenReview={() => setIsReviewOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Retro Bottom Navigation Bar (matches reference image tabs) */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        cardsCount={cards.length}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-in slide-in-from-top-4 duration-300 max-w-sm">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-bold ${
              toast.type === "success"
                ? "bg-[#bef264] text-slate-950 border-[#a3e635] shadow-[#bef264]/20"
                : toast.type === "error"
                ? "bg-rose-500 text-white border-rose-600 shadow-rose-500/20"
                : "bg-slate-900 text-white border-slate-700 shadow-black/30"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
              ) : toast.type === "error" ? (
                <AlertCircle className="w-5 h-5 shrink-0" />
              ) : null}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-black/10 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        cards={cards}
        dictionaries={dictionaries}
        onUpdateCardReview={handleUpdateCardReview}
      />

      <AnkiGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSettings={() => {
          setIsGuideOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <AnkiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={ankiSettings}
        onSaveSettings={handleSaveSettings}
        onOpenGuide={() => {
          setIsSettingsOpen(false);
          setIsGuideOpen(true);
        }}
      />

      <VercelDeployModal
        isOpen={isVercelOpen}
        onClose={() => setIsVercelOpen(false)}
      />

      <NewDictionaryModal
        isOpen={isNewDictOpen}
        onClose={() => setIsNewDictOpen(false)}
        onCreateDictionary={handleCreateDictionary}
      />

      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        cardsCount={cards.length}
        unsyncedToAnkiCount={cards.filter((c) => c.ankiStatus !== "synced").length}
        onSyncLocalCardsToCloud={handleManualSyncToCloud}
      />
    </div>
  );
}
