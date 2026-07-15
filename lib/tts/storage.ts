import {
  DEFAULT_SPEECH_SPEED,
  type PlayerPrefs,
  type VoicePref,
} from "@/lib/tts/types";

const STORAGE_KEY = "blog-tts-prefs";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readPrefs(): PlayerPrefs {
  if (!isBrowser()) {
    return { voice: null, speed: DEFAULT_SPEECH_SPEED };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { voice: null, speed: DEFAULT_SPEECH_SPEED };
    }
    const parsed = JSON.parse(raw) as Partial<PlayerPrefs>;
    return {
      voice:
        parsed.voice &&
        typeof parsed.voice.name === "string" &&
        typeof parsed.voice.lang === "string"
          ? parsed.voice
          : null,
      speed:
        typeof parsed.speed === "number" && parsed.speed > 0
          ? parsed.speed
          : DEFAULT_SPEECH_SPEED,
    };
  } catch {
    return { voice: null, speed: DEFAULT_SPEECH_SPEED };
  }
}

function writePrefs(prefs: PlayerPrefs): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore quota / privacy mode errors.
  }
}

export function getVoicePref(): VoicePref | null {
  return readPrefs().voice;
}

export function setVoicePref(voice: VoicePref): void {
  const prefs = readPrefs();
  writePrefs({ ...prefs, voice });
}

export function getSpeed(): number {
  return readPrefs().speed;
}

export function setSpeed(speed: number): void {
  const prefs = readPrefs();
  writePrefs({ ...prefs, speed });
}
