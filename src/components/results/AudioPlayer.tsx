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
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-[18px] px-[22px] rounded-[var(--radius)]"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--accent-border)",
      }}
    >
      <audio ref={audioRef} src={audioUrl} className="hidden" />

      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center outline-none transition-transform hover:scale-105"
        style={{
          border: "1.5px solid var(--accent-border)",
          background: "var(--accent-dim)",
          color: "var(--accent)",
        }}
      >
        {!isPlaying ? (
          <span className="text-sm ml-0.5">▶</span>
        ) : (
          <span className="text-sm">⏸</span>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 font-[family-name:var(--font-dm-mono)]"
          style={{ color: "var(--accent)" }}
        >
          dublagem gerada
        </div>
        <div
          className="w-full h-[3px] rounded-sm cursor-pointer relative"
          style={{ background: "var(--border)" }}
          onClick={handleProgressClick}
        >
          <div
            className="h-full rounded-sm pointer-events-none transition-all duration-100 ease-linear"
            style={{
              background: "var(--accent)",
              width: `${progress * 100}%`,
            }}
          />
        </div>
        <div
          className="text-[11px] mt-1.5 font-[family-name:var(--font-dm-mono)]"
          style={{ color: "var(--text-dim)" }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="self-end sm:self-center px-[14px] py-2 rounded-[var(--radius-sm)] text-[11px] tracking-[0.05em] uppercase font-[family-name:var(--font-dm-mono)] transition-colors hover:text-[var(--text)] whitespace-nowrap"
        style={{
          background: "none",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        baixar
      </button>
    </motion.div>
  );
}
