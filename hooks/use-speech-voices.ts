"use client";

import { useCallback, useEffect, useState } from "react";
import { getVoicePref, setVoicePref } from "@/lib/tts/storage";
import type { UseSpeechVoicesReturn } from "@/lib/tts/types";

function findVoiceByPref(
  voices: SpeechSynthesisVoice[],
  pref: { name: string; lang: string } | null,
): SpeechSynthesisVoice | null {
  if (!pref || voices.length === 0) return voices[0] ?? null;
  return (
    voices.find((v) => v.name === pref.name && v.lang === pref.lang) ??
    voices.find((v) => v.lang === pref.lang) ??
    voices[0] ??
    null
  );
}

export function useSpeechVoices(): UseSpeechVoicesReturn {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  });
  const [selectedVoice, setSelectedVoiceState] =
    useState<SpeechSynthesisVoice | null>(() => {
      const initial =
        typeof window !== "undefined" && window.speechSynthesis
          ? window.speechSynthesis.getVoices()
          : [];
      return findVoiceByPref(initial, getVoicePref());
    });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return false;
    return window.speechSynthesis.getVoices().length === 0;
  });

  const syncVoices = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsLoading(false);
      return;
    }

    const available = window.speechSynthesis.getVoices();
    if (available.length === 0) return;

    setVoices(available);
    setSelectedVoiceState((current) => {
      if (current) return current;
      return findVoiceByPref(available, getVoicePref());
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.addEventListener("voiceschanged", syncVoices);
    const timer = window.setTimeout(syncVoices, 250);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", syncVoices);
      window.clearTimeout(timer);
    };
  }, [syncVoices]);

  const setSelectedVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoiceState(voice);
    setVoicePref({ name: voice.name, lang: voice.lang });
  }, []);

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    isLoading,
  };
}
