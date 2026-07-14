import { z } from "zod";

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

const articleSchema = z.object({
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
  tags: z.array(z.string()),
  slugBase: z.string().min(1),
});

function getAiConfig() {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = (process.env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  if (!apiKey) throw new Error("AI_API_KEY is not configured");
  return { apiKey, baseUrl, model };
}

async function chatJson(system: string, user: string): Promise<unknown> {
  const { apiKey, baseUrl, model } = getAiConfig();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
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
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty content");
  return JSON.parse(content) as unknown;
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
    } catch {
      throw firstError instanceof Error
        ? firstError
        : new Error("AI response failed schema validation");
    }
  }
}

export async function generateTopics(input: {
  categoryName: string;
  categoryDescription?: string;
  count: number;
}): Promise<string[]> {
  const count = Math.min(100, Math.max(1, Math.floor(input.count)));
  const system =
    'You are an SEO content strategist. Respond ONLY with valid JSON matching this schema: {"topics": string[]}';
  const user = [
    `Generate exactly ${count} unique blog topic ideas for the category "${input.categoryName}".`,
    input.categoryDescription
      ? `Category description: ${input.categoryDescription}`
      : "",
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
}): Promise<GeneratedArticle> {
  const system = `You are an SEO content writer. Respond ONLY with valid JSON matching this schema:
{
  "title": string,
  "seoTitle": string,
  "metaDescription": string,
  "summary": string,
  "content": string (HTML with h2/h3/p/ul/li; for math use $inline$ or $$block$$ LaTeX, or native <math> MathML),
  "faq": [{"question": string, "answer": string}],
  "tags": string[],
  "slugBase": string (lowercase kebab-case, no leading/trailing dashes)
}`;

  const user = [
    `Write a complete SEO blog article.`,
    `Category: ${input.categoryName}`,
    `Topic: ${input.topic}`,
    "Include 3–6 FAQ items. Content should be substantial HTML (1000+ words equivalent).",
    "When formulas are needed, use LaTeX ($...$ inline, $$...$$ display) or MathML <math> elements.",
  ].join("\n");

  return chatJsonWithRetry(system, user, articleSchema);
}
