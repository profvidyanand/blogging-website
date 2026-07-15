export type SpeechState = "idle" | "speaking" | "paused" | "stopped";

export type QueueItem = {
  text: string;
  sentenceIndex: number;
};

export type ExtractedArticle = {
  items: QueueItem[];
  totalSentences: number;
};

export type VoicePref = {
  name: string;
  lang: string;
};

export type PlayerPrefs = {
  voice: VoicePref | null;
  speed: number;
};

export const SPEECH_SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;
export type SpeechSpeed = (typeof SPEECH_SPEED_OPTIONS)[number];

export const DEFAULT_SPEECH_SPEED: SpeechSpeed = 1;

export type UseSpeechVoicesReturn = {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  isLoading: boolean;
};

export type UseSpeechQueueOptions = {
  items: QueueItem[];
  voice: SpeechSynthesisVoice | null;
  speed: number;
  onSentenceChange?: (index: number) => void;
};

export type UseSpeechQueueReturn = {
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  currentSentenceIndex: number;
  totalSentences: number;
  progress: number;
  isSpeaking: boolean;
  isPaused: boolean;
  speed: number;
  setSpeed: (rate: number) => void;
  state: SpeechState;
};
