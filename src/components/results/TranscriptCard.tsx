"use client";

import { motion } from "framer-motion";

interface TranscriptCardProps {
  type: "original" | "translated";
  language: string;
  text: string;
  visible: boolean;
}

export default function TranscriptCard({
  type,
  language,
  text,
  visible,
}: TranscriptCardProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="p-5 rounded-[var(--radius)]"
      style={{
        background: "rgba(255, 255, 255, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)"
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.12em] font-[family-name:var(--font-dm-mono)]"
          style={{
            color: type === "translated" ? "var(--accent)" : "rgba(240,237,232,0.35)",
          }}
        >
          {type} · {language}
        </span>
      </div>
      <p className="text-[15px] font-normal leading-[1.65]" style={{ color: "var(--text)" }}>
        {text}
      </p>
    </motion.div>
  );
}
