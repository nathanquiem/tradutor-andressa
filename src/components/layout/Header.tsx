"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-baseline gap-3 mb-10"
    >
      <h1
        className="text-[28px] font-extrabold tracking-[-0.04em]"
        style={{ color: "var(--accent)" }}
      >
        tradutor de voz
      </h1>
    </motion.header>
  );
}
