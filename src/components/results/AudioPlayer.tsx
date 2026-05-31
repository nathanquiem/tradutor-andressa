"use client";

import { motion } from "framer-motion";
import { useAudioPlayer, formatTime } from "@/hooks/useAudioPlayer";

interface AudioPlayerProps {
  audioUrl: string | null;
  visible: boolean;
}

export default function AudioPlayer({ audioUrl, visible }: AudioPlayerProps) {
  const { isPlaying, currentTime, duration, progress, audioRef, togglePlay, seek } =
    useAudioPlayer(audioUrl);

  if (!visible || !audioUrl) return null;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `dub_${Date.now()}.mp3`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "20px 24px",
        width: "100%",
        borderRadius: "var(--radius)",
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
      }}
    >
      <audio ref={audioRef} src={audioUrl} className="hidden" />

      {/* Linha Superior: Play + Info + Download */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={togglePlay}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid var(--accent-border)",
              background: "var(--accent-dim)",
              color: "var(--accent)",
              cursor: "pointer",
              outline: "none",
            }}
            className="transition-transform hover:scale-105"
          >
            {!isPlaying ? (
              <span style={{ fontSize: 14, marginLeft: 2 }}>▶</span>
            ) : (
              <span style={{ fontSize: 14 }}>⏸</span>
            )}
          </button>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              className="font-[family-name:var(--font-dm-mono)]"
              style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)" }}
            >
              dublagem gerada
            </span>
            <span
              className="font-[family-name:var(--font-dm-mono)]"
              style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="font-[family-name:var(--font-dm-mono)] transition-colors hover:text-[var(--text)]"
          style={{
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
            fontSize: 11,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          baixar
        </button>
      </div>

      {/* Linha Inferior: Barra de Progresso */}
      <div
        style={{
          width: "100%",
          height: 4,
          borderRadius: 2,
          background: "var(--border)",
          cursor: "pointer",
          position: "relative",
        }}
        onClick={handleProgressClick}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            background: "var(--accent)",
            width: `${progress * 100}%`,
            pointerEvents: "none",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </motion.div>
  );
}
