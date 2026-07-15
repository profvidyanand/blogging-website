"use client";

type ReadingProgressProps = {
  currentIndex: number;
  totalSentences: number;
  progress: number;
  isActive: boolean;
};

export function ReadingProgress({
  currentIndex,
  totalSentences,
  progress,
  isActive,
}: ReadingProgressProps) {
  if (totalSentences === 0) return null;

  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {isActive && displayIndex > 0
            ? `Sentence ${displayIndex} of ${totalSentences}`
            : `${totalSentences} sentences`}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
