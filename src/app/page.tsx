
"use client";

import { useEffect, useState } from "react";
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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("app_password_andressa") === "110721") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "110721") {
      localStorage.setItem("app_password_andressa", "110721");
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <main className="flex flex-col items-center justify-center w-full" style={{ padding: '0 1rem', minHeight: '80vh', maxWidth: '400px', margin: '0 auto' }}>
        <div 
          className="bg-white rounded-2xl shadow-xl w-full flex flex-col items-center"
          style={{ padding: '2rem', border: '1px solid rgba(0,0,0,0.1)' }}
        >
          <div 
            className="bg-[#222222] rounded-xl flex items-center justify-center shadow-md"
            style={{ width: '3rem', height: '3rem', marginBottom: '1.5rem' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="text-white" style={{ width: '1.5rem', height: '1.5rem' }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="font-bold text-[#222222] font-[family-name:var(--font-syne)]" style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>Acesso Restrito</h1>
          <p className="text-gray-500 text-center" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>Digite a senha para acessar o Tradutor de Voz.</p>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col" style={{ gap: '1rem' }}>
            <div>
              <input
                type="password"
                placeholder="Senha"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                className={`w-full rounded-xl outline-none transition-colors`}
                style={{ 
                  padding: '0.75rem 1rem', 
                  backgroundColor: authError ? '#fef2f2' : '#f9fafb',
                  border: authError ? '1px solid #ef4444' : '1px solid #e5e7eb',
                }}
              />
              {authError && <p className="text-red-500" style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginLeft: '0.25rem' }}>Senha incorreta</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#222222] hover:bg-[#111111] text-white font-medium rounded-xl transition-colors shadow-md"
              style={{ padding: '0.75rem 0', height: '3rem' }}
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
    );
  }

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
