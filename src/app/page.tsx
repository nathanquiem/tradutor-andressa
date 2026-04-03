
"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRecorder } from "@/hooks/useRecorder";

// Componentes
import Header from "@/components/layout/Header";
import RecordButton from "@/components/recorder/RecordButton";
import Waveform from "@/components/recorder/Waveform";
import Timer from "@/components/recorder/Timer";
import StatusBar from "@/components/ui/StatusBar";
import DetectedLangBadge from "@/components/ui/DetectedLangBadge";
import TranscriptCard from "@/components/results/TranscriptCard";
import AudioPlayer from "@/components/results/AudioPlayer";

export default function Home() {
  const store = useAppStore();
  const { isRecording, seconds, stream, startRecording, stopRecording } = useRecorder();

  // Função principal que orquestra o pipeline ao parar de gravar
  const handleToggleRecord = async () => {
    if (!isRecording) {
      store.reset();
      await startRecording();
      store.setStatus("recording");
    } else {
      store.setStatus("transcribing");
      const blob = await stopRecording();
      await processAudio(blob);
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      // 1. Transcrever (Whisper Auto-detect)
      const form = new FormData();
      form.append("audio", blob, "audio.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });

      if (!transcribeRes.ok) {
        const error = await transcribeRes.json();
        throw new Error(error.error || "Transcription failed");
      }

      const { text: originalText, detectedLanguage } = await transcribeRes.json();
      store.setOriginalText(originalText);
      store.setDetectedLanguage(detectedLanguage);

      if (!originalText.trim()) {
        throw new Error("Áudio não detectou fala");
      }

      // 2. Traduzir (GPT-4o)
      store.setStatus("translating");
      const isPortuguese = detectedLanguage === "pt" || detectedLanguage?.toLowerCase() === "portuguese";
      const targetLang = isPortuguese ? "English" : "Português Brasileiro";

      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          targetLanguage: targetLang,
        }),
      });

      if (!translateRes.ok) {
        const error = await translateRes.json();
        throw new Error(error.error || "Translation failed");
      }

      const { text: translatedText } = await translateRes.json();
      store.setTranslatedText(translatedText);

      // 3. Sintetizar Dublagem (ElevenLabs)
      store.setStatus("synthesizing");
      const synthesizeRes = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: translatedText }),
      });

      if (!synthesizeRes.ok) {
        const error = await synthesizeRes.json();
        throw new Error(error.error || "Synthesis failed");
      }

      const audioBlob = await synthesizeRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      store.setAudio(audioUrl, audioBlob);

      store.setStatus("done");
    } catch (error: any) {
      store.setStatus("error", `Erro: ${error.message}`);
    }
  };

  // Status derivados
  const isProcessing =
    store.status !== "idle" &&
    store.status !== "recording" &&
    store.status !== "done" &&
    store.status !== "error";

  const showResults = Boolean(store.originalText || store.translatedText);
  const isPortuguese = store.detectedLanguage === "pt" || store.detectedLanguage?.toLowerCase() === "portuguese";
  const targetLanguageTag = isPortuguese ? "en" : "pt";

  return (
    <main className="flex flex-col items-center px-4 w-full max-w-[560px] relative z-10 w-full">
      <Header />

      <div className="flex flex-col flex-1 items-center w-full gap-6">
        {/* Container principal de gravação */}
        <div className="flex flex-col items-center gap-6 w-full mb-6">
          <Timer seconds={seconds} visible={isRecording} />

          <div className="w-full relative min-h-[52px]">
            <Waveform stream={stream} visible={isRecording} />
          </div>

          <RecordButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            onClick={handleToggleRecord}
          />
        </div>

        <StatusBar status={store.status} message={store.statusMessage} />

        <DetectedLangBadge
          detectedLanguage={store.detectedLanguage}
          visible={Boolean(store.detectedLanguage && store.status !== "recording" && store.status !== "idle")}
        />

        {/* Resultados */}
        <div className="w-full flex-col flex gap-4 mt-4">
          <TranscriptCard
            type="original"
            language={store.detectedLanguage || "???"}
            text={store.originalText}
            visible={showResults}
          />

          <TranscriptCard
            type="translated"
            language={targetLanguageTag}
            text={store.translatedText}
            visible={showResults}
          />

          <AudioPlayer audioUrl={store.audioUrl} visible={Boolean(store.audioUrl)} />
        </div>
      </div>

      <footer className="fixed bottom-6 w-full left-0 text-center text-[10px] uppercase tracking-[0.1em] font-[family-name:var(--font-dm-mono)]" style={{ color: "var(--text-muted)" }}>
        <span className="block mb-1">Desenvolvido por</span>
        <a 
          href="https://nathanquiem.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium hover:opacity-70 transition-opacity"
          style={{ color: "var(--accent)" }}
        >
          Nathan Quiem
        </a>
      </footer>
    </main>
  );
}
