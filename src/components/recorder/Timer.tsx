"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TimerProps {
  seconds: number;
  visible: boolean;
}

export default function Timer({ seconds, visible }: TimerProps) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="font-[family-name:var(--font-dm-mono)] text-[32px] font-light tracking-tight"
          style={{ color: "var(--text)" }}
        >
          {m}:{s}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
