import { z } from "zod";
import { slugify } from "@/lib/slug";

export interface GeneratedArticle {
  title: string;
  seoTitle: string;
  metaDescription: string;
  summary: string;
  content: string;
  faq: { question: string; answer: string }[];
  tags: string[];
  slugBase: string;
  /** Exactly 3 English Unsplash search phrases, most → least specific. */
  imageQueries: string[];
}

const topicsSchema = z.object({
  topics: z.array(z.string().min(1)).min(1),
});

function normalizeImageQueries(queries: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const query of queries) {
    const cleaned = query.trim().replace(/\s+/g, " ");
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(cleaned);
    if (normalized.length === 3) break;
  }
  return normalized;
}

const articleSchema = z
  .object({
    title: z.string().min(1),
    seoTitle: z.string().min(1),
    metaDescription: z.string().min(1),
    summary: z.string().min(1),
    content: z.string().min(1),
    faq: z.array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    ),
    tags: z.array(z.string()).default([]),
    slugBase: z.string().optional(),
    imageQueries: z.array(z.string().trim().min(1)).length(3),
  })
  .transform((data) => ({
    ...data,
    tags: data.tags ?? [],
    slugBase: slugify(data.slugBase || data.title),
    // Dedupe while preserving order; keep up to 3 for Unsplash fallbacks.
    imageQueries: normalizeImageQueries(data.imageQueries),
  }))
  .refine((data) => data.imageQueries.length > 0, {
    path: ["imageQueries"],
    message: "imageQueries must contain at least one non-empty English query",
  });

function getAiConfig() {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const maxTokens = Number(process.env.AI_MAX_TOKENS || "4096");
  if (!apiKey) throw new Error("AI_API_KEY is not configured");
  return { apiKey, baseUrl, model, maxTokens };
}

/** Keep completion budget small for topic lists (Groq TPM limits are often ~8k total). */
function topicMaxTokens(count: number): number {
  const configured = Number(process.env.AI_MAX_TOKENS || "4096");
  return Math.min(256 + count * 64, configured);
}

function articleMaxTokens(): number {
  return Number(process.env.AI_MAX_TOKENS || "4096");
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const jsonText = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(jsonText) as unknown;
}

async function chatJson(
  system: string,
  user: string,
  maxTokensOverride?: number,
): Promise<unknown> {
  const { apiKey, baseUrl, model, maxTokens } = getAiConfig();
  const effectiveMaxTokens = maxTokensOverride ?? maxTokens;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: effectiveMaxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
  };
  const choice = data.choices?.[0];
  const content = choice?.message?.content?.trim();
  if (!content) {
    throw new Error("AI returned empty content");
  }
  if (choice?.finish_reason === "length") {
    throw new Error("AI response was truncated; try again or use a shorter topic");
  }

  try {
    return parseJsonContent(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }
}

function formatSchemaError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join("; ");
  }
  if (error instanceof Error) return error.message;
  return "Unknown validation error";
}

async function chatJsonWithRetry<T>(
  system: string,
  user: string,
  schema: z.ZodType<T>,
  maxTokensOverride?: number,
): Promise<T> {
  try {
    const raw = await chatJson(system, user, maxTokensOverride);
    return schema.parse(raw);
  } catch (firstError) {
    const raw = await chatJson(
      system,
      `${user}\n\nYour last response was invalid JSON matching the schema. Retry and respond ONLY with valid JSON.`,
      maxTokensOverride,
    );
    try {
      return schema.parse(raw);
    } catch (secondError) {
      const firstMessage = formatSchemaError(firstError);
      const secondMessage = formatSchemaError(secondError);
      throw new Error(
        `AI response failed validation: ${secondMessage || firstMessage}`,
      );
    }
  }
}

export async function generateTopics(input: {
  categoryName: string;
  categoryDescription?: string;
  languageLabel: string;
  count: number;
}): Promise<string[]> {
  const count = Math.min(100, Math.max(1, Math.floor(input.count)));
  const batchSize = 15;
  const topics: string[] = [];

  for (let offset = 0; offset < count; offset += batchSize) {
    const batchCount = Math.min(batchSize, count - offset);
    const batch = await generateTopicBatch({ ...input, count: batchCount });
    topics.push(...batch);
  }

  return topics.slice(0, count);
}

async function generateTopicBatch(input: {
  categoryName: string;
  categoryDescription?: string;
  languageLabel: string;
  count: number;
}): Promise<string[]> {
  const count = Math.min(100, Math.max(1, Math.floor(input.count)));
  const languageLabel = input.languageLabel;
  const system =
    'You are an SEO content strategist. Respond ONLY with valid JSON matching this schema: {"topics": string[]}';
  const user = [
    `Generate exactly ${count} unique blog topic ideas for the category "${input.categoryName}".`,
    input.categoryDescription
      ? `Category description (treat as editorial brief and constraints for topic ideas): ${input.categoryDescription}`
      : "",
    `Write every topic title in ${languageLabel} only.`,
    "Topics should be specific, searchable, and suitable for long-form SEO articles.",
    "Stay within the category scope. Follow any guidance in the category description; do not invent category-specific extras that were not requested.",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await chatJsonWithRetry(
    system,
    user,
    topicsSchema,
    topicMaxTokens(count),
  );
  return result.topics.slice(0, count);
}

export async function generateArticle(input: {
  topic: string;
  categoryName: string;
  categoryDescription?: string;
  languageLabel: string;
}): Promise<GeneratedArticle> {
  const languageLabel = input.languageLabel;
  const system = `You are an SEO content writer. Respond ONLY with valid JSON matching this schema:
{
  "title": string,
  "seoTitle": string,
  "metaDescription": string,
  "summary": string,
  "content": string (HTML using h2/h3/p/ul/li; if the category description requests math or special notation, you may use $inline$ / $$block$$ LaTeX or <math> MathML),
  "faq": [{"question": string, "answer": string}],
  "tags": string[],
  "slugBase": string (lowercase kebab-case using Latin characters only, no leading/trailing dashes),
  "imageQueries": string[3] (exactly 3 distinct English Unsplash photo search phrases)
}`;

  const user = [
    "Write a complete SEO blog article.",
    `Category: ${input.categoryName}`,
    input.categoryDescription
      ? `Category description (treat as editorial brief and content requirements): ${input.categoryDescription}`
      : "",
    `Topic: ${input.topic}`,
    `Write the entire article in ${languageLabel} only. All fields except slugBase and imageQueries must be in ${languageLabel}.`,
    "For slugBase, use romanized/transliterated lowercase kebab-case in Latin characters, even if the article is in another language.",
    "Include 3–6 FAQ items. Content should be substantial HTML with multiple sections (roughly 1000–1400 words).",
    "Follow the category description for tone, depth, and any special requirements (for example formulas, theorems, live market data, or other domain details).",
    "Do not add formulas, theorems, prices, or other specialized elements unless the category description or topic clearly calls for them.",
    "We fetch a landscape featured image from Unsplash using your imageQueries. Provide exactly 3 English search phrases (2–5 concrete visual keywords each), ordered most specific to the article first, then broader fallbacks.",
    "imageQueries must be English only (even for non-English articles). Prefer photorealistic, searchable subjects (people, places, objects, nature, rituals, tools) that match the article — not abstract SEO slogans, brand names, or text overlays.",
    'Example: ["morning yoga meditation mat", "sunrise yoga outdoor practice", "peaceful meditation lifestyle"].',
  ]
    .filter(Boolean)
    .join("\n");

  return chatJsonWithRetry(system, user, articleSchema, articleMaxTokens());
}
