import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureUniqueSlug } from "@/lib/slug";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";
import { revalidatePublicContent } from "@/lib/revalidate-public";
import { sanitizeArticleHtml } from "@/lib/sanitize-article-html";
import { syncInlineImageInContent } from "@/lib/inline-article-image";
import type { Database } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };
type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"];

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  seoTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  content: z.string().optional(),
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().nullable().optional(),
  inlineImage: z.string().nullable().optional(),
  inlineImageCredit: z.string().nullable().optional(),
});

export async function PATCH(request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body");
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("articles")
    .select("slug, status, category_id, content, inline_image, inline_image_credit")
    .eq("id", id)
    .maybeSingle();

  const d = parsed.data;
  const updates: ArticleUpdate = {};

  if (d.title !== undefined) updates.title = d.title;
  if (d.seoTitle !== undefined) updates.seo_title = d.seoTitle;
  if (d.metaDescription !== undefined) updates.meta_description = d.metaDescription;
  if (d.summary !== undefined) updates.summary = d.summary;
  if (d.faq !== undefined) updates.faq = d.faq;
  if (d.tags !== undefined) updates.tags = d.tags;
  if (d.featuredImage !== undefined) updates.featured_image = d.featuredImage;

  const contentTouched =
    d.content !== undefined ||
    d.inlineImage !== undefined ||
    d.inlineImageCredit !== undefined;

  if (contentTouched) {
    const baseContent =
      d.content !== undefined
        ? sanitizeArticleHtml(d.content)
        : (existing?.content ?? "");
    const inlineImage =
      d.inlineImage !== undefined ? d.inlineImage : (existing?.inline_image ?? null);
    const inlineImageCredit =
      d.inlineImageCredit !== undefined
        ? d.inlineImageCredit
        : (existing?.inline_image_credit ?? null);

    updates.content = syncInlineImageInContent(
      baseContent,
      inlineImage,
      inlineImageCredit,
    );
    updates.inline_image = inlineImage?.trim() ? inlineImage.trim() : null;
    updates.inline_image_credit = inlineImage?.trim()
      ? (inlineImageCredit?.trim() ?? null)
      : null;
  }

  if (d.slug !== undefined) {
    updates.slug = await ensureUniqueSlug(d.slug, async (candidate) => {
      const { data } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", candidate)
        .neq("id", id)
        .maybeSingle();
      return !!data;
    });
  }

  const { data: article, error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!article) return jsonError("Article not found", 404);

  if (existing?.status === "published" || article.status === "published") {
    const { data: category } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", article.category_id)
      .maybeSingle();

    revalidatePublicContent({
      articleSlug: article.slug,
      previousArticleSlug: existing?.slug,
      categorySlug: category?.slug,
    });
  }

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "article.update",
    entityType: "article",
    entityId: id,
  });

  return NextResponse.json({ article });
}

export async function DELETE(_request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("articles")
    .select("slug, status, category_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);

  if (existing?.status === "published") {
    const { data: category } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", existing.category_id)
      .maybeSingle();

    revalidatePublicContent({
      articleSlug: existing.slug,
      categorySlug: category?.slug,
    });
  }

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "article.delete",
    entityType: "article",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
