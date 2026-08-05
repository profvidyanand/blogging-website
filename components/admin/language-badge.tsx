import { cn } from "@/lib/utils";
import { getLanguageLabel, normalizeLanguage, type Language } from "@/lib/types";

export function LanguageBadge({
  language,
  className,
}: {
  language: Language | string | null | undefined;
  className?: string;
}) {
  const normalized = normalizeLanguage(language);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {getLanguageLabel(normalized)}
    </span>
  );
}
