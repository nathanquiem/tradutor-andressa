"use client";

import { useEffect, useRef, useCallback } from "react";

export function useWaveform(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  stream: MediaStream | null
) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const run = () => {
      animFrameRef.current = requestAnimationFrame(run);
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;

      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, W, H);

      const bars = 48;
      const bw = W / bars - 2;

      for (let i = 0; i < bars; i++) {
        const v = data[Math.floor((i * data.length) / bars)] / 255;
        const bh = Math.max(3, v * H * 0.85);
        const x = i * (bw + 2);
        const y = (H - bh) / 2;

        ctx.fillStyle = `rgba(34,34,34,${0.15 + v * 0.6})`;
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, 2);
        ctx.fill();
      }
    };
    run();
  }, [canvasRef]);

  useEffect(() => {
    if (!stream) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioCtx.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
    };
  }, [stream, draw]);
}
