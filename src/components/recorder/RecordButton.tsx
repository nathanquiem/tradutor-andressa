"use client";

import { motion } from "framer-motion";

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onClick: () => void;
}

export default function RecordButton({
  isRecording,
  isProcessing,
  onClick,
}: RecordButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isProcessing}
      whileHover={!isProcessing ? { scale: 1.06 } : undefined}
      whileTap={!isProcessing ? { scale: 0.95 } : undefined}
      className="relative w-[88px] h-[88px] rounded-full flex items-center justify-center outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-shadow shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
      style={{
        background: isRecording ? "var(--red-dim)" : "rgba(255, 255, 255, 0.6)",
        border: `1.5px solid ${isRecording ? "var(--red)" : "rgba(255, 255, 255, 0.8)"}`,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Pulse ring animation when recording */}
      {isRecording && (
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(217,88,67,0.3)",
              "0 0 0 14px rgba(217,88,67,0)",
              "0 0 0 0 rgba(217,88,67,0.3)",
            ],
          }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Dot / Stop icon */}
      <motion.span
        animate={{
          borderRadius: isRecording ? "4px" : "50%",
          width: isRecording ? 18 : 22,
          height: isRecording ? 18 : 22,
        }}
        transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 20 }}
        style={{ background: "var(--red)" }}
      />
    </motion.button>
  );
}
