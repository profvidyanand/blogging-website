import { cn } from "@/lib/utils";
import { getLanguageLabel } from "@/lib/languages";

export function LanguageBadge({
  language,
  labels,
  className,
}: {
  language: string | null | undefined;
  labels?: Record<string, string>;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {getLanguageLabel(language, labels)}
    </span>
  );
}
