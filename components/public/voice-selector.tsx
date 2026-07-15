"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type VoiceSelectorProps = {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  disabled?: boolean;
  loading?: boolean;
};

export function VoiceSelector({
  voices,
  selectedVoice,
  onVoiceChange,
  disabled = false,
  loading = false,
}: VoiceSelectorProps) {
  const value = selectedVoice
    ? `${selectedVoice.name}::${selectedVoice.lang}`
    : "";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Label htmlFor="tts-voice" className="text-xs text-muted-foreground">
        Voice
      </Label>
      <Select
        value={value}
        onValueChange={(next) => {
          const voice = voices.find((v) => `${v.name}::${v.lang}` === next);
          if (voice) onVoiceChange(voice);
        }}
        disabled={disabled || loading || voices.length === 0}
      >
        <SelectTrigger id="tts-voice" size="sm" className="w-full max-w-[220px]">
          {loading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Spinner className="size-3.5" />
              Loading voices…
            </span>
          ) : (
            <SelectValue placeholder="Select voice" />
          )}
        </SelectTrigger>
        <SelectContent>
          {voices.map((voice) => (
            <SelectItem
              key={`${voice.name}::${voice.lang}`}
              value={`${voice.name}::${voice.lang}`}
            >
              {voice.name} ({voice.lang})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
