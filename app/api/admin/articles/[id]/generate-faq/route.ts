import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateFaq } from "@/lib/ai";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";
import { DEFAULT_LANGUAGE, getLanguageLabel, getLanguageMap } from "@/lib/languages";
import type { Category } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
});

export async function POST(request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id: articleId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body");
  }

  const supabase = await createClient();

  const { data: articleRow, error: articleError } = await supabase
    .from("articles")
    .select("id, category_id")
    .eq("id", articleId)
    .maybeSingle();

  if (articleError) return jsonError(articleError.message, 500);
  if (!articleRow) return jsonError("Article not found", 404);

  const { data: categoryRow, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", articleRow.category_id)
    .maybeSingle();

  if (catError) return jsonError(catError.message, 500);
  if (!categoryRow) return jsonError("Category not found", 404);

  const category = categoryRow as Category;

  let faq;
  try {
    const languageMap = await getLanguageMap(supabase);
    faq = await generateFaq({
      title: parsed.data.title,
      content: parsed.data.content,
      languageLabel: getLanguageLabel(
        category.language ?? DEFAULT_LANGUAGE,
        languageMap,
      ),
    });
  } catch (err) {
    console.error("FAQ generation failed:", err);
    return jsonError(
      err instanceof Error ? err.message : "FAQ generation failed",
      502,
    );
  }

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "article.generate_faq",
    entityType: "article",
    entityId: articleId,
  });

  return NextResponse.json({ faq });
}
