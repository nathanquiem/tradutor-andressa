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
      style={{
        padding: "24px",
        width: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span
          className="text-[10px] font-medium uppercase tracking-[0.12em] font-[family-name:var(--font-dm-mono)]"
          style={{
            color: type === "translated" ? "var(--accent)" : "var(--text-dim)",
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
