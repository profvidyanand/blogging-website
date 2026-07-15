import { mathNodeToSpeech } from "@/lib/tts/math-to-speech";
import { segmentSentences } from "@/lib/tts/sentence-segmenter";
import type { ExtractedArticle, QueueItem } from "@/lib/tts/types";

const BLOCK_SELECTOR =
  "h1,h2,h3,h4,p,li,blockquote,th,td,.math-display";

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4"]);
const MATH_BLOCK_CLASS = "math-display";

function isSkippedElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  return (
    tag === "pre" ||
    tag === "code" ||
    tag === "figcaption" ||
    el.classList.contains("math-error")
  );
}

function isInsideSkippedSubtree(el: Element, root: Element): boolean {
  let current: Element | null = el;
  while (current && current !== root) {
    if (isSkippedElement(current)) return true;
    current = current.parentElement;
  }
  return false;
}

function isMathElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  return (
    tag === "math" ||
    el.classList.contains("math-inline") ||
    el.classList.contains("math-display") ||
    el.classList.contains("katex") ||
    el.classList.contains("katex-display")
  );
}

function isMathBlock(el: HTMLElement): boolean {
  return el.classList.contains(MATH_BLOCK_CLASS);
}

function isAlreadyAnnotated(root: HTMLElement): boolean {
  return root.querySelector("[data-sentence-idx]") !== null;
}

function getBlockElements(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR);
  return [...nodes].filter((el) => !isInsideSkippedSubtree(el, root));
}

function extractTextFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  if (isSkippedElement(el)) return "";
  if (isMathElement(el)) return mathNodeToSpeech(el);

  const tag = el.tagName.toLowerCase();
  if (tag === "br") return " ";

  return extractTextFromChildren(el);
}

function extractTextFromChildren(el: Element): string {
  let text = "";
  for (const child of el.childNodes) {
    text += extractTextFromNode(child);
  }
  return text;
}

function getBlockText(block: HTMLElement): string {
  return extractTextFromChildren(block).replace(/\s+/g, " ").trim();
}

type TextNodeRef = {
  node: Text;
  start: number;
  end: number;
};

function collectTextNodes(block: HTMLElement): TextNodeRef[] {
  const refs: TextNodeRef[] = [];
  let offset = 0;

  function walk(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text.length > 0) {
        refs.push({
          node: node as Text,
          start: offset,
          end: offset + text.length,
        });
        offset += text.length;
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    if (isSkippedElement(el)) return;
    if (isMathElement(el)) {
      const speech = mathNodeToSpeech(el);
      offset += speech.length;
      return;
    }

    if (el.tagName.toLowerCase() === "br") {
      offset += 1;
      return;
    }

    for (const child of el.childNodes) walk(child);
  }

  for (const child of block.childNodes) walk(child);
  return refs;
}

function wrapSentenceInBlock(
  block: HTMLElement,
  sentence: string,
  sentenceIndex: number,
  fullText: string,
  sentenceStart: number,
): void {
  const span = document.createElement("span");
  span.dataset.sentenceIdx = String(sentenceIndex);
  span.dataset.ttsText = sentence;
  span.className = "tts-sentence";

  const sentenceEnd = sentenceStart + sentence.length;
  const textNodes = collectTextNodes(block);

  if (textNodes.length === 0) {
    span.textContent = sentence;
    block.appendChild(span);
    return;
  }

  const nodesInRange = textNodes.filter(
    (ref) => ref.end > sentenceStart && ref.start < sentenceEnd,
  );

  if (nodesInRange.length === 0) {
    span.textContent = sentence;
    block.appendChild(span);
    return;
  }

  const first = nodesInRange[0];
  const last = nodesInRange[nodesInRange.length - 1];

  const range = document.createRange();
  const startOffset = Math.max(0, sentenceStart - first.start);
  const endOffset = Math.min(last.node.length, sentenceEnd - last.start);

  range.setStart(first.node, startOffset);
  range.setEnd(last.node, endOffset);

  try {
    range.surroundContents(span);
  } catch {
    span.textContent =
      fullText.slice(sentenceStart, sentenceEnd).trim() || sentence;
    block.appendChild(span);
  }
}

function annotateBlock(
  block: HTMLElement,
  sentences: string[],
  startIndex: number,
): number {
  if (block.querySelector("[data-sentence-idx]")) {
    return startIndex + sentences.length;
  }

  const fullText = getBlockText(block);
  if (!fullText) return startIndex;

  if (sentences.length === 1) {
    const span = document.createElement("span");
    span.dataset.sentenceIdx = String(startIndex);
    span.dataset.ttsText = sentences[0];
    span.className = "tts-sentence";
    while (block.firstChild) {
      span.appendChild(block.firstChild);
    }
    block.appendChild(span);
    return startIndex + 1;
  }

  let charOffset = 0;
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const idx = startIndex + i;
    const start = fullText.indexOf(sentence, charOffset);
    const sentenceStart = start >= 0 ? start : charOffset;
    wrapSentenceInBlock(block, sentence, idx, fullText, sentenceStart);
    charOffset = sentenceStart + sentence.length;
  }

  return startIndex + sentences.length;
}

function buildFromAnnotatedSpans(
  root: HTMLElement,
  title: string,
): ExtractedArticle {
  const items: QueueItem[] = [];

  if (title.trim()) {
    items.push({ text: title.trim(), sentenceIndex: 0 });
  }

  const spans = root.querySelectorAll<HTMLElement>("[data-sentence-idx]");
  for (const span of spans) {
    const idx = Number(span.dataset.sentenceIdx);
    const text =
      span.dataset.ttsText?.trim() ||
      span.textContent?.replace(/\s+/g, " ").trim() ||
      "";
    if (!text || Number.isNaN(idx)) continue;
    items.push({ text, sentenceIndex: idx });
  }

  items.sort((a, b) => a.sentenceIndex - b.sentenceIndex);

  return { items, totalSentences: items.length };
}

export function prepareArticleForTts(
  root: HTMLElement,
  title: string,
): ExtractedArticle {
  if (isAlreadyAnnotated(root)) {
    return buildFromAnnotatedSpans(root, title);
  }

  const items: QueueItem[] = [];
  let sentenceIndex = 0;

  if (title.trim()) {
    items.push({ text: title.trim(), sentenceIndex });
    sentenceIndex += 1;
  }

  const blocks = getBlockElements(root);

  for (const block of blocks) {
    const text = getBlockText(block);
    if (!text) continue;

    const isHeading = HEADING_TAGS.has(block.tagName);
    const isStandaloneMath = isMathBlock(block);
    const sentences =
      isHeading || isStandaloneMath ? [text] : segmentSentences(text);

    for (const sentence of sentences) {
      items.push({ text: sentence, sentenceIndex });
      sentenceIndex += 1;
    }

    annotateBlock(block, sentences, sentenceIndex - sentences.length);
  }

  return {
    items,
    totalSentences: items.length,
  };
}
