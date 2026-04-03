"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (percent: number) => void;
}

export function useAudioPlayer(audioUrl?: string | null): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Desacelerar a voz do ElevenLabs um pouco (0.75x a velocidade original)
    audio.playbackRate = 0.75;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    if (audio.readyState > 0) {
      setDuration(audio.duration || 0);
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const play = useCallback(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current?.paused) {
      play();
    } else {
      pause();
    }
  }, [play, pause]);

  const seek = useCallback(
    (percent: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = percent * duration;
    },
    [duration]
  );

  const progress = duration ? currentTime / duration : 0;

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    audioRef,
    play,
    pause,
    togglePlay,
    seek,
  };
}

export function formatTime(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
