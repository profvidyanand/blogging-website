"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SPEECH_SPEED_OPTIONS } from "@/lib/tts/types";
import { cn } from "@/lib/utils";

type SpeedSelectorProps = {
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
};

export function SpeedSelector({
  speed,
  onSpeedChange,
  disabled = false,
}: SpeedSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">Speed</Label>
      <div className="flex flex-wrap gap-1">
        {SPEECH_SPEED_OPTIONS.map((option) => (
          <Button
            key={option}
            type="button"
            size="xs"
            variant={speed === option ? "default" : "outline"}
            disabled={disabled}
            className={cn("min-w-[3rem]")}
            onClick={() => onSpeedChange(option)}
          >
            {option}x
          </Button>
        ))}
      </div>
    </div>
  );
}
