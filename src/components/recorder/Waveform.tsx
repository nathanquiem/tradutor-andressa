"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useWaveform } from "@/hooks/useWaveform";

interface WaveformProps {
  stream: MediaStream | null;
  visible: boolean;
}

export default function Waveform({ stream, visible }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useWaveform(canvasRef, stream);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-[52px] rounded-[var(--radius)] overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </motion.div>
  );
}
