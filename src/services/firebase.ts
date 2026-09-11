import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { WordCard, Dictionary } from "../types";

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: The app will break without specifying firestoreDatabaseId */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on startup as mandated by Skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Auth Operations
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error) {
    console.error("Google sign in failed:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out failed:", error);
    throw error;
  }
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Profile Sync
export async function syncUserProfile(user: User): Promise<void> {
  const userPath = `users/${user.uid}`;
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        id: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

// Cards Firestore CRUD
export async function saveCardToCloud(userId: string, card: WordCard): Promise<void> {
  const cardPath = `users/${userId}/cards/${card.id}`;
  try {
    const cardRef = doc(db, "users", userId, "cards", card.id);
    const payload = {
      id: card.id,
      userId,
      original: card.original || "",
      translation: card.translation || "",
      alternatives: card.alternatives || [],
      transcription: card.transcription || "",
      partOfSpeech: card.partOfSpeech || "",
      definition: card.definition || "",
      exampleEn: card.exampleEn || "",
      exampleRu: card.exampleRu || "",
      mnemonic: card.mnemonic || "",
      tags: card.tags || [],
      dictionaryId: card.dictionaryId || "default",
      ankiStatus: card.ankiStatus || "not_added",
      ankiNoteId: card.ankiNoteId || null,
      ankiError: card.ankiError || null,
      createdAt: card.createdAt || Date.now(),
    };
    await setDoc(cardRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, cardPath);
  }
}

export async function deleteCardFromCloud(userId: string, cardId: string): Promise<void> {
  const cardPath = `users/${userId}/cards/${cardId}`;
  try {
    const cardRef = doc(db, "users", userId, "cards", cardId);
    await deleteDoc(cardRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, cardPath);
  }
}

export function subscribeToCloudCards(
  userId: string,
  onUpdate: (cards: WordCard[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const cardsPath = `users/${userId}/cards`;
  const cardsCol = collection(db, "users", userId, "cards");

  return onSnapshot(
    cardsCol,
    (snapshot) => {
      const cards: WordCard[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id,
          original: d.original,
          translation: d.translation,
          alternatives: d.alternatives || [],
          transcription: d.transcription || "",
          partOfSpeech: d.partOfSpeech || "",
          definition: d.definition || "",
          exampleEn: d.exampleEn || "",
          exampleRu: d.exampleRu || "",
          mnemonic: d.mnemonic || "",
          tags: d.tags || [],
          dictionaryId: d.dictionaryId || "default",
          ankiStatus: d.ankiStatus || "not_added",
          ankiNoteId: d.ankiNoteId || undefined,
          ankiError: d.ankiError || undefined,
          createdAt: d.createdAt || Date.now(),
        } as WordCard;
      });
      onUpdate(cards);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, cardsPath);
    }
  );
}

// Dictionaries Firestore CRUD
export async function saveDictionaryToCloud(userId: string, dict: Dictionary): Promise<void> {
  const dictPath = `users/${userId}/dictionaries/${dict.id}`;
  try {
    const dictRef = doc(db, "users", userId, "dictionaries", dict.id);
    const payload = {
      id: dict.id,
      userId,
      name: dict.name,
      description: dict.description || "",
      icon: dict.icon || "BookOpen",
      color: dict.color || "indigo",
      isDefault: Boolean(dict.isDefault),
      createdAt: dict.createdAt || Date.now(),
    };
    await setDoc(dictRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, dictPath);
  }
}

export async function deleteDictionaryFromCloud(userId: string, dictId: string): Promise<void> {
  const dictPath = `users/${userId}/dictionaries/${dictId}`;
  try {
    const dictRef = doc(db, "users", userId, "dictionaries", dictId);
    await deleteDoc(dictRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, dictPath);
  }
}

export function subscribeToCloudDictionaries(
  userId: string,
  onUpdate: (dictionaries: Dictionary[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const dictsPath = `users/${userId}/dictionaries`;
  const dictsCol = collection(db, "users", userId, "dictionaries");

  return onSnapshot(
    dictsCol,
    (snapshot) => {
      const dicts: Dictionary[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id,
          name: d.name,
          description: d.description || "",
          icon: d.icon || "BookOpen",
          color: d.color || "indigo",
          isDefault: Boolean(d.isDefault),
          createdAt: d.createdAt || Date.now(),
        } as Dictionary;
      });
      onUpdate(dicts);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, dictsPath);
    }
  );
}

// Migrate initial / local cards to cloud on first login
export async function uploadLocalDataToCloud(
  userId: string,
  localCards: WordCard[],
  localDictionaries: Dictionary[]
): Promise<void> {
  try {
    const batch = writeBatch(db);

    for (const dict of localDictionaries) {
      const dictRef = doc(db, "users", userId, "dictionaries", dict.id);
      batch.set(
        dictRef,
        {
          id: dict.id,
          userId,
          name: dict.name,
          description: dict.description || "",
          icon: dict.icon || "BookOpen",
          color: dict.color || "indigo",
          isDefault: Boolean(dict.isDefault),
          createdAt: dict.createdAt || Date.now(),
        },
        { merge: true }
      );
    }

    for (const card of localCards) {
      const cardRef = doc(db, "users", userId, "cards", card.id);
      batch.set(
        cardRef,
        {
          id: card.id,
          userId,
          original: card.original || "",
          translation: card.translation || "",
          alternatives: card.alternatives || [],
          transcription: card.transcription || "",
          partOfSpeech: card.partOfSpeech || "",
          definition: card.definition || "",
          exampleEn: card.exampleEn || "",
          exampleRu: card.exampleRu || "",
          mnemonic: card.mnemonic || "",
          tags: card.tags || [],
          dictionaryId: card.dictionaryId || "default",
          ankiStatus: card.ankiStatus || "not_added",
          ankiNoteId: card.ankiNoteId || null,
          ankiError: card.ankiError || null,
          createdAt: card.createdAt || Date.now(),
        },
        { merge: true }
      );
    }

    await batch.commit();
  } catch (error) {
    console.error("Failed to upload local data to cloud:", error);
  }
}
