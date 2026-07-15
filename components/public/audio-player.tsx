"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Headphones,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReadingProgress } from "@/components/public/reading-progress";
import { SpeedSelector } from "@/components/public/speed-selector";
import { VoiceSelector } from "@/components/public/voice-selector";
import { useSpeechQueue } from "@/hooks/use-speech-queue";
import { useSpeechVoices } from "@/hooks/use-speech-voices";
import { prepareArticleForTts } from "@/lib/tts/content-extractor";
import { getSpeed } from "@/lib/tts/storage";
import type { QueueItem } from "@/lib/tts/types";
import { cn } from "@/lib/utils";

type AudioPlayerProps = {
  title: string;
};

const MANUAL_SCROLL_PAUSE_MS = 3000;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

export function AudioPlayer({ title }: AudioPlayerProps) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const [statusMessage, setStatusMessage] = useState("");
  const [autoScrollPausedUntil, setAutoScrollPausedUntil] = useState(0);

  const rootRef = useRef<HTMLElement | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const { voices, selectedVoice, setSelectedVoice, isLoading: voicesLoading } =
    useSpeechVoices();

  const queue = useSpeechQueue({
    items,
    voice: selectedVoice,
    speed: getSpeed(),
    onSentenceChange: setActiveSentenceIdx,
  });

  const stopRef = useRef(queue.stop);
  stopRef.current = queue.stop;

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-tts-root]");
    if (!root) return;

    rootRef.current = root;
    const extracted = prepareArticleForTts(root, title);
    setItems(extracted.items);
  }, [title]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root
      .querySelectorAll(".tts-active")
      .forEach((el) => el.classList.remove("tts-active"));

    if (activeSentenceIdx < 0) {
      previousActiveRef.current = null;
      return;
    }

    const active = root.querySelector<HTMLElement>(
      `[data-sentence-idx="${activeSentenceIdx}"]`,
    );

    if (active) {
      active.classList.add("tts-active");
      previousActiveRef.current = active;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const now = Date.now();

      if (!prefersReducedMotion && now >= autoScrollPausedUntil) {
        active.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [activeSentenceIdx, autoScrollPausedUntil]);

  useEffect(() => {
    const pauseAutoScroll = () => {
      setAutoScrollPausedUntil(Date.now() + MANUAL_SCROLL_PAUSE_MS);
    };

    window.addEventListener("wheel", pauseAutoScroll, { passive: true });
    window.addEventListener("touchmove", pauseAutoScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", pauseAutoScroll);
      window.removeEventListener("touchmove", pauseAutoScroll);
    };
  }, []);

  const announce = useCallback((message: string) => {
    setStatusMessage(message);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (items.length === 0) return;

    if (queue.isSpeaking) {
      queue.pause();
      announce("Paused");
      return;
    }

    if (queue.isPaused) {
      queue.resume();
      announce("Reading resumed");
      return;
    }

    queue.play();
    announce("Reading started");
  }, [announce, items.length, queue]);

  const handleStop = useCallback(() => {
    queue.stop();
    announce("Stopped");
  }, [announce, queue]);

  const handleNext = useCallback(() => {
    queue.next();
  }, [queue]);

  const handlePrevious = useCallback(() => {
    queue.previous();
  }, [queue]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.code === "Space") {
        event.preventDefault();
        handlePlayPause();
        return;
      }

      if (event.code === "ArrowRight") {
        event.preventDefault();
        handleNext();
        return;
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
        return;
      }

      if (event.code === "Escape") {
        event.preventDefault();
        handleStop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePlayPause, handlePrevious, handleStop]);

  useEffect(() => {
    return () => {
      stopRef.current();
    };
  }, []);

  const isActive = queue.isSpeaking || queue.isPaused;
  const playLabel = useMemo(() => {
    if (queue.isSpeaking) return "Pause";
    if (queue.isPaused) return "Resume";
    return "Play";
  }, [queue.isPaused, queue.isSpeaking]);

  if (items.length === 0) return null;

  return (
    <section
      className="audio-player rounded-xl border border-border bg-muted/30 p-4"
      aria-label="Listen to article"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Headphones className="size-4" aria-hidden />
        Listen to this article
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handlePlayPause}
          aria-label={playLabel}
        >
          {queue.isSpeaking ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
          {playLabel}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleStop}
          disabled={!isActive}
          aria-label="Stop"
        >
          <Square className="size-4" />
          Stop
        </Button>

        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={handlePrevious}
          disabled={!isActive}
          aria-label="Previous sentence"
        >
          <SkipBack className="size-4" />
        </Button>

        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={handleNext}
          disabled={!isActive}
          aria-label="Next sentence"
        >
          <SkipForward className="size-4" />
        </Button>

        <span
          className={cn(
            "text-xs",
            queue.isSpeaking ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden
        >
          {queue.isSpeaking ? "Speaking…" : queue.isPaused ? "Paused" : "Ready"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <VoiceSelector
          voices={voices}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          disabled={voicesLoading || isActive}
          loading={voicesLoading}
        />
        <SpeedSelector
          speed={queue.speed}
          onSpeedChange={queue.setSpeed}
          disabled={voicesLoading}
        />
      </div>

      <div className="mt-4">
        <ReadingProgress
          currentIndex={queue.currentSentenceIndex}
          totalSentences={queue.totalSentences}
          progress={queue.progress}
          isActive={isActive}
        />
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>
    </section>
  );
}
