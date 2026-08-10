const INLINE_FIGURE_REGEX =
  /<figure\s+class=["']article-inline-image["'][^>]*>[\s\S]*?<\/figure>/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export type InlineImageData = {
  url: string;
  credit: string;
};

export function buildInlineImageFigure(url: string, credit: string): string {
  const safeUrl = escapeHtml(url);
  const safeCredit = escapeHtml(credit);
  return `<figure class="article-inline-image"><img src="${safeUrl}" alt="" loading="lazy" /><figcaption>${safeCredit}</figcaption></figure>`;
}

/** Read the mid-article inline figure from stored HTML. */
export function extractInlineImageFromContent(
  content: string,
): InlineImageData | null {
  const match = content.match(INLINE_FIGURE_REGEX);
  if (!match) return null;

  const figureHtml = match[0];
  const srcMatch = figureHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!srcMatch?.[1]) return null;

  const creditMatch = figureHtml.match(
    /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
  );

  return {
    url: decodeHtml(srcMatch[1]),
    credit: creditMatch?.[1] ? decodeHtml(creditMatch[1].trim()) : "",
  };
}

/** Remove the mid-article inline figure from HTML. */
export function removeInlineImageFromContent(content: string): string {
  return content.replace(INLINE_FIGURE_REGEX, "");
}

/** Insert or replace the mid-article inline figure URL in HTML. */
export function syncInlineImageInContent(
  content: string,
  url: string | null | undefined,
  credit?: string | null,
): string {
  const trimmedUrl = url?.trim() ?? "";
  const withoutFigure = removeInlineImageFromContent(content).trim();

  if (!trimmedUrl) return withoutFigure;

  const existing = extractInlineImageFromContent(content);
  const figureHtml = buildInlineImageFigure(
    trimmedUrl,
    credit?.trim() || existing?.credit || "",
  );

  if (INLINE_FIGURE_REGEX.test(content)) {
    return content.replace(INLINE_FIGURE_REGEX, figureHtml);
  }

  return insertInlineImageIntoContent(withoutFigure, figureHtml);
}

export function resolveInlineImage(article: {
  content: string;
  inline_image?: string | null;
  inline_image_credit?: string | null;
}): InlineImageData | null {
  if (article.inline_image?.trim()) {
    return {
      url: article.inline_image.trim(),
      credit: article.inline_image_credit?.trim() ?? "",
    };
  }

  return extractInlineImageFromContent(article.content);
}

/** Insert an inline figure roughly midway through article HTML. */
export function insertInlineImageIntoContent(
  content: string,
  figureHtml: string,
): string {
  const trimmed = content.trim();
  if (!trimmed) return figureHtml;

  const h2Regex = /<h2[^>]*>[\s\S]*?<\/h2>/gi;
  const h2Matches = [...trimmed.matchAll(h2Regex)];

  if (h2Matches.length >= 2) {
    const midIndex = Math.floor(h2Matches.length / 2);
    const nextH2 = h2Matches[midIndex + 1];
    const insertBefore = nextH2?.index ?? trimmed.length;
    return trimmed.slice(0, insertBefore) + figureHtml + trimmed.slice(insertBefore);
  }

  const pRegex = /<\/p>/gi;
  const pMatches = [...trimmed.matchAll(pRegex)];

  if (pMatches.length >= 2) {
    const midIndex = Math.floor(pMatches.length / 2);
    const match = pMatches[midIndex]!;
    const insertPos = match.index! + match[0].length;
    return trimmed.slice(0, insertPos) + figureHtml + trimmed.slice(insertPos);
  }

  return trimmed + figureHtml;
}
