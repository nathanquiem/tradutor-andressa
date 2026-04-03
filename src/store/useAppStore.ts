import { create } from "zustand";
import type { AppStatus } from "@/types";

interface AppState {
  status: AppStatus;
  statusMessage: string;
  detectedLanguage: string | null;
  originalText: string;
  translatedText: string;
  audioUrl: string | null;
  audioBlob: Blob | null;

  setStatus: (status: AppStatus, message?: string) => void;
  setDetectedLanguage: (lang: string) => void;
  setOriginalText: (text: string) => void;
  setTranslatedText: (text: string) => void;
  setAudio: (url: string, blob: Blob) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  status: "idle",
  statusMessage: "",
  detectedLanguage: null,
  originalText: "",
  translatedText: "",
  audioUrl: null,
  audioBlob: null,

  setStatus: (status, message = "") => set({ status, statusMessage: message }),
  setDetectedLanguage: (lang) => set({ detectedLanguage: lang }),
  setOriginalText: (text) => set({ originalText: text }),
  setTranslatedText: (text) => set({ translatedText: text }),
  setAudio: (url, blob) => set({ audioUrl: url, audioBlob: blob }),
  reset: () =>
    set({
      status: "idle",
      statusMessage: "",
      detectedLanguage: null,
      originalText: "",
      translatedText: "",
      audioUrl: null,
      audioBlob: null,
    }),
}));
