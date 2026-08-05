import { z } from "zod";
import { getLanguageLabel, type Language } from "@/lib/types";
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
}

const topicsSchema = z.object({
  topics: z.array(z.string().min(1)).min(1),
});

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
  })
  .transform((data) => ({
    ...data,
    tags: data.tags ?? [],
    slugBase: slugify(data.slugBase || data.title),
  }));

function getAiConfig() {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const maxTokens = Number(process.env.AI_MAX_TOKENS || "16384");
  if (!apiKey) throw new Error("AI_API_KEY is not configured");
  return { apiKey, baseUrl, model, maxTokens };
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const jsonText = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(jsonText) as unknown;
}

async function chatJson(system: string, user: string): Promise<unknown> {
  const { apiKey, baseUrl, model, maxTokens } = getAiConfig();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: maxTokens,
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
): Promise<T> {
  try {
    const raw = await chatJson(system, user);
    return schema.parse(raw);
  } catch (firstError) {
    const raw = await chatJson(
      system,
      `${user}\n\nYour last response was invalid JSON matching the schema. Retry and respond ONLY with valid JSON.`,
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
  language: Language;
  count: number;
}): Promise<string[]> {
  const count = Math.min(100, Math.max(1, Math.floor(input.count)));
  const languageLabel = getLanguageLabel(input.language);
  const system =
    'You are an SEO content strategist. Respond ONLY with valid JSON matching this schema: {"topics": string[]}';
  const user = [
    `Generate exactly ${count} unique blog topic ideas for the category "${input.categoryName}".`,
    input.categoryDescription
      ? `Category description: ${input.categoryDescription}`
      : "",
    `Write every topic title in ${languageLabel} only.`,
    "Topics should be specific, searchable, and suitable for long-form SEO articles.",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await chatJsonWithRetry(system, user, topicsSchema);
  return result.topics.slice(0, count);
}

export async function generateArticle(input: {
  topic: string;
  categoryName: string;
  language: Language;
}): Promise<GeneratedArticle> {
  const languageLabel = getLanguageLabel(input.language);
  const system = `You are an SEO content writer. Respond ONLY with valid JSON matching this schema:
{
  "title": string,
  "seoTitle": string,
  "metaDescription": string,
  "summary": string,
  "content": string (HTML with h2/h3/p/ul/li; for math use $inline$ or $$block$$ LaTeX, or native <math> MathML),
  "faq": [{"question": string, "answer": string}],
  "tags": string[],
  "slugBase": string (lowercase kebab-case using Latin characters only, no leading/trailing dashes)
}`;

  const user = [
    `Write a complete SEO blog article.`,
    `Category: ${input.categoryName}`,
    `Topic: ${input.topic}`,
    `Write the entire article in ${languageLabel} only. All fields except slugBase must be in ${languageLabel}.`,
    "For slugBase, use romanized/transliterated lowercase kebab-case in Latin characters, even if the article is in another language.",
    "Include 3–6 FAQ items. Content should be substantial HTML with multiple sections (roughly 800–1200 words).",
    "When formulas are needed, use LaTeX ($...$ inline, $$...$$ display) or MathML <math> elements.",
  ].join("\n");

  return chatJsonWithRetry(system, user, articleSchema);
}
