"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AppStatus } from "@/types";

interface StatusBarProps {
  status: AppStatus;
  message: string;
}

const statusColors: Record<string, string> = {
  idle: "var(--text-muted)",
  recording: "var(--red)",
  transcribing: "var(--accent)",
  translating: "var(--accent)",
  synthesizing: "var(--accent)",
  done: "var(--green)",
  error: "var(--red)",
};

const defaultMessages: Record<string, string> = {
  idle: "pressione para gravar",
  recording: "clique para parar",
  transcribing: "transcrevendo com whisper...",
  translating: "traduzindo com gpt-4o...",
  synthesizing: "gerando dublagem com elevenlabs...",
  done: "pronto",
  error: "erro",
};

export default function StatusBar({ status, message }: StatusBarProps) {
  const displayMessage = message || defaultMessages[status] || "";
  const color = statusColors[status] || "var(--text-muted)";

  return (
    <div className="text-center min-h-[18px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={displayMessage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="font-[family-name:var(--font-dm-mono)] text-xs font-medium tracking-[0.06em]"
          style={{ color }}
        >
          {displayMessage}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
