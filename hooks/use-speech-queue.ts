"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSpeed, setSpeed as persistSpeed } from "@/lib/tts/storage";
import type {
  SpeechState,
  UseSpeechQueueOptions,
  UseSpeechQueueReturn,
} from "@/lib/tts/types";

export function useSpeechQueue({
  items,
  voice,
  speed: initialSpeed,
  onSentenceChange,
}: UseSpeechQueueOptions): UseSpeechQueueReturn {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [state, setState] = useState<SpeechState>("idle");
  const [speed, setSpeedState] = useState(initialSpeed || getSpeed());

  const itemsRef = useRef(items);
  const voiceRef = useRef(voice);
  const speedRef = useRef(speed);
  const stateRef = useRef(state);
  const onSentenceChangeRef = useRef(onSentenceChange);
  const speakAtIndexRef = useRef<(index: number) => void>(() => {});
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    onSentenceChangeRef.current = onSentenceChange;
  }, [onSentenceChange]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const totalSentences = items.length;
  const progress =
    totalSentences === 0
      ? 0
      : currentIndex < 0
        ? 0
        : (currentIndex + 1) / totalSentences;

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakAtIndex = useCallback(
    (index: number) => {
      if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        index < 0 ||
        index >= itemsRef.current.length
      ) {
        setState("stopped");
        setCurrentIndex(-1);
        return;
      }

      cancelSpeech();

      const item = itemsRef.current[index];
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.rate = speedRef.current;
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }

      utterance.onstart = () => {
        setCurrentIndex(index);
        setState("speaking");
        onSentenceChangeRef.current?.(item.sentenceIndex);
      };

      utterance.onend = () => {
        if (stateRef.current === "paused") return;
        const nextIndex = index + 1;
        if (nextIndex < itemsRef.current.length) {
          speakAtIndexRef.current(nextIndex);
        } else {
          setState("stopped");
          setCurrentIndex(-1);
        }
      };

      utterance.onerror = () => {
        if (stateRef.current !== "paused") {
          setState("stopped");
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [cancelSpeech],
  );

  useEffect(() => {
    speakAtIndexRef.current = speakAtIndex;
  }, [speakAtIndex]);

  const play = useCallback(() => {
    if (itemsRef.current.length === 0) return;

    const startIndex =
      currentIndexRef.current >= 0 &&
      currentIndexRef.current < itemsRef.current.length
        ? currentIndexRef.current
        : 0;

    setState("speaking");
    speakAtIndexRef.current(startIndex);
  }, []);

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    setState("paused");
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (stateRef.current !== "paused") return;
    setState("speaking");
    window.speechSynthesis.resume();
  }, []);

  const stop = useCallback(() => {
    cancelSpeech();
    setState("stopped");
    setCurrentIndex(-1);
    onSentenceChangeRef.current?.(-1);
  }, [cancelSpeech]);

  const next = useCallback(() => {
    const idx =
      currentIndexRef.current < 0 ? 0 : currentIndexRef.current + 1;
    if (idx >= itemsRef.current.length) return;
    setState("speaking");
    speakAtIndexRef.current(idx);
  }, []);

  const previous = useCallback(() => {
    const idx =
      currentIndexRef.current <= 0 ? 0 : currentIndexRef.current - 1;
    setState("speaking");
    speakAtIndexRef.current(idx);
  }, []);

  const setSpeed = useCallback((rate: number) => {
    setSpeedState(rate);
    persistSpeed(rate);
    speedRef.current = rate;

    if (stateRef.current === "speaking" && currentIndexRef.current >= 0) {
      speakAtIndexRef.current(currentIndexRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, [cancelSpeech]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && stateRef.current === "speaking") {
        cancelSpeech();
        setState("paused");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [cancelSpeech]);

  return {
    play,
    pause,
    resume,
    stop,
    next,
    previous,
    currentSentenceIndex: currentIndex,
    totalSentences,
    progress,
    isSpeaking: state === "speaking",
    isPaused: state === "paused",
    speed,
    setSpeed,
    state,
  };
}
