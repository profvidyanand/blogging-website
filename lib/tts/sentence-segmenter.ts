function regexSegmentSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const sentences: string[] = [];
  const pattern = /[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(trimmed)) !== null) {
    const sentence = match[0].trim();
    if (sentence) sentences.push(sentence);
  }

  return sentences.length > 0 ? sentences : [trimmed];
}

export function segmentSentences(text: string, locale = "en"): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter(locale, { granularity: "sentence" });
      const segments = [...segmenter.segment(trimmed)]
        .map((s) => s.segment.trim())
        .filter(Boolean);
      if (segments.length > 0) return segments;
    } catch {
      // Fall through to regex.
    }
  }

  return regexSegmentSentences(trimmed);
}
