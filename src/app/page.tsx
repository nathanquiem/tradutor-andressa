
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

  /* ──────────── TELA DE LOGIN ──────────── */
  if (!isAuthenticated) {
    return (
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 400,
          margin: "0 auto",
          padding: "0 16px",
          minHeight: "100dvh",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2.5rem 2rem",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 20,
            border: "1px solid var(--border-strong)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--accent)",
              marginBottom: 24,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24, color: "#fff" }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>
            Acesso Restrito
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 28, lineHeight: 1.5 }}>
            Digite a senha para acessar o Tradutor de Voz.
          </p>

          <form onSubmit={handleLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <input
                type="password"
                placeholder="Senha"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: authError ? "1px solid var(--red)" : "1px solid var(--border-strong)",
                  background: authError ? "var(--red-dim)" : "var(--surface)",
                  color: "var(--text)",
                  outline: "none",
                  fontSize: "1rem",
                }}
              />
              {authError && <p style={{ color: "var(--red)", fontSize: 12, marginTop: 6, marginLeft: 4 }}>Senha incorreta</p>}
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
    );
  }

  /* ──────────── TELA PRINCIPAL ──────────── */
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
        padding: "40px 16px 100px", // Padding bottom extra para o rodapé absolute
        minHeight: "100dvh",
        position: "relative",
      }}
    >
      <div style={{ margin: "auto 0", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <Header />

        {/* Container principal de gravação */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", marginBottom: 24 }}>
          <Timer seconds={seconds} visible={isRecording} />

          <div style={{ width: "100%", position: "relative", minHeight: 52 }}>
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
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24, marginTop: 0 }}>
          <AudioPlayer audioUrl={store.audioUrl} visible={Boolean(store.audioUrl)} />

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
        </div>
      </div>

      <footer
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
        }}
        className="font-[family-name:var(--font-dm-mono)]"
      >
        <span style={{ display: "block", marginBottom: 4 }}>Desenvolvido por</span>
        <a
          href="https://nathanquiem.com.br"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", fontWeight: 500 }}
        >
          Nathan Quiem
        </a>
      </footer>
    </main>
  );
}
