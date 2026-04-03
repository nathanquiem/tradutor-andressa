export type AppStatus =
  | "idle"
  | "recording"
  | "transcribing"
  | "translating"
  | "synthesizing"
  | "done"
  | "error";

export interface TranscriptionResult {
  text: string;
  detectedLanguage: string;
}

export interface TranslationResult {
  text: string;
}
