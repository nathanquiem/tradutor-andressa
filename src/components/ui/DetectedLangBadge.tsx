"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DetectedLangBadgeProps {
  detectedLanguage: string | null;
  visible: boolean;
}

const langNames: Record<string, string> = {
  en: "English", english: "English",
  pt: "Português", portuguese: "Português",
  es: "Español", spanish: "Español",
  fr: "Français", french: "Français",
  de: "Deutsch", german: "Deutsch",
  it: "Italiano", italian: "Italiano",
  ja: "日本語", japanese: "日本語",
  ko: "한국어", korean: "한국어",
  zh: "中文", chinese: "中文",
  ru: "Русский", russian: "Русский",
  ar: "العربية", arabic: "العربية",
};

const langFlags: Record<string, string> = {
  en: "🇺🇸", english: "🇺🇸",
  pt: "🇧🇷", portuguese: "🇧🇷",
  es: "🇪🇸", spanish: "🇪🇸",
  fr: "🇫🇷", french: "🇫🇷",
  de: "🇩🇪", german: "🇩🇪",
  it: "🇮🇹", italian: "🇮🇹",
  ja: "🇯🇵", japanese: "🇯🇵",
  ko: "🇰🇷", korean: "🇰🇷",
  zh: "🇨🇳", chinese: "🇨🇳",
  ru: "🇷🇺", russian: "🇷🇺",
  ar: "🇸🇦", arabic: "🇸🇦",
};

function getTargetLang(detected: string): string {
  if (detected === "pt" || detected.toLowerCase() === "portuguese") return "EN";
  return "PT";
}

export default function DetectedLangBadge({
  detectedLanguage,
  visible,
}: DetectedLangBadgeProps) {
  if (!detectedLanguage || !visible) return null;

  const flag = langFlags[detectedLanguage] || "🌍";
  const name = langNames[detectedLanguage] || detectedLanguage.toUpperCase();
  const target = getTargetLang(detectedLanguage);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-[family-name:var(--font-dm-mono)] text-xs tracking-[0.06em]"
          style={{
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          <span>{flag}</span>
          <span>{name} detectado</span>
          <span style={{ color: "var(--text-dim)" }}>→</span>
          <span>traduzindo para {target}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
