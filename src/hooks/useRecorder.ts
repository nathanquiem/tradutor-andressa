"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseRecorderReturn {
  isRecording: boolean;
  seconds: number;
  stream: MediaStream | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
}

export function useRecorder(): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveRef = useRef<((blob: Blob) => void) | null>(null);

  useEffect(() => {
    // Only cleanup on unmount, don't depend on stream state
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setStream(mediaStream);

    chunksRef.current = [];
    const recorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      resolveRef.current?.(blob);
      resolveRef.current = null;
    };

    mediaRecorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);
    setSeconds(0);

    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }

      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }

      setIsRecording(false);
    });
  }, [stream]);

  return { isRecording, seconds, stream, startRecording, stopRecording };
}
