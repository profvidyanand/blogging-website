import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateArticle } from "@/lib/ai";
import { SITE } from "@/lib/site-config";
import { searchImageWithFallbacks, trackDownload } from "@/lib/unsplash";
import {
  buildInlineImageFigure,
  insertInlineImageIntoContent,
} from "@/lib/inline-article-image";
import { ensureUniqueSlug } from "@/lib/slug";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";
import { DEFAULT_LANGUAGE, getLanguageLabel, getLanguageMap } from "@/lib/languages";
import type { Category, FaqItem, Topic } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id: topicId } = await context.params;
  const supabase = await createClient();

  const { data: topicRow, error: topicError } = await supabase
    .from("topics")
    .select("*")
    .eq("id", topicId)
    .maybeSingle();

  if (topicError) return jsonError(topicError.message, 500);
  if (!topicRow) return jsonError("Topic not found", 404);

  const topic = topicRow as Topic;
  if (topic.status === "generated") {
    return jsonError("Article already generated for this topic", 400);
  }

  const { data: categoryRow, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", topic.category_id)
    .maybeSingle();

  if (catError) return jsonError(catError.message, 500);
  if (!categoryRow) return jsonError("Category not found", 404);
  const category = categoryRow as Category;

  let generated;
  try {
    const languageMap = await getLanguageMap(supabase);
    generated = await generateArticle({
      topic: topic.topic,
      categoryName: category.name,
      categoryDescription: category.description ?? undefined,
      languageLabel: getLanguageLabel(
        category.language ?? DEFAULT_LANGUAGE,
        languageMap,
      ),
    });
  } catch (err) {
    console.error("Article generation failed:", err);
    return jsonError(
      err instanceof Error ? err.message : "Article generation failed",
      502,
    );
  }

  const slug = await ensureUniqueSlug(generated.slugBase || generated.title, async (candidate) => {
    const { data } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return !!data;
  });

  let featuredImage: string | null = null;
  let featuredImageCredit: string | null = null;
  let inlineImage: string | null = null;
  let inlineImageCredit: string | null = null;
  let content = generated.content;

  try {
    const featuredPhoto = await searchImageWithFallbacks(generated.imageQueries);
    if (featuredPhoto) {
      await trackDownload(featuredPhoto);
      featuredImage = featuredPhoto.url;
      featuredImageCredit = featuredPhoto.credit;
    }

    const inlinePhoto = await searchImageWithFallbacks(
      generated.inlineImageQueries,
      { excludeIds: featuredPhoto ? [featuredPhoto.id] : [] },
    );
    if (inlinePhoto) {
      await trackDownload(inlinePhoto);
      inlineImage = inlinePhoto.url;
      inlineImageCredit = inlinePhoto.credit;
      content = insertInlineImageIntoContent(
        content,
        buildInlineImageFigure(inlinePhoto.url, inlinePhoto.credit),
      );
    }
  } catch (err) {
    console.error("Image pipeline failed (continuing without image):", err);
  }

  const authorName = SITE.client.fullName;

  const faq = generated.faq as FaqItem[];

  const { data: article, error: insertError } = await supabase
    .from("articles")
    .insert({
      topic_id: topicId,
      category_id: topic.category_id,
      title: generated.title,
      slug,
      seo_title: generated.seoTitle,
      meta_description: generated.metaDescription,
      summary: generated.summary,
      content,
      faq,
      tags: generated.tags,
      featured_image: featuredImage,
      featured_image_credit: featuredImageCredit,
      inline_image: inlineImage,
      inline_image_credit: inlineImageCredit,
      author_name: authorName,
      status: "draft",
      created_by: auth.admin.id,
    })
    .select()
    .single();

  if (insertError || !article) {
    // Retry on unique slug violation
    if (insertError?.code === "23505") {
      const retrySlug = await ensureUniqueSlug(`${slug}-x`, async (c) => {
        const { data } = await supabase
          .from("articles")
          .select("id")
          .eq("slug", c)
          .maybeSingle();
        return !!data;
      });
      const { data: retryArticle, error: retryError } = await supabase
        .from("articles")
        .insert({
          topic_id: topicId,
          category_id: topic.category_id,
          title: generated.title,
          slug: retrySlug,
          seo_title: generated.seoTitle,
          meta_description: generated.metaDescription,
          summary: generated.summary,
          content,
          faq,
          tags: generated.tags,
          featured_image: featuredImage,
          featured_image_credit: featuredImageCredit,
          inline_image: inlineImage,
          inline_image_credit: inlineImageCredit,
          author_name: authorName,
          status: "draft",
          created_by: auth.admin.id,
        })
        .select()
        .single();
      if (retryError || !retryArticle) {
        return jsonError(retryError?.message ?? "Failed to insert article", 500);
      }
      await supabase
        .from("topics")
        .update({ status: "generated" })
        .eq("id", topicId);
      await logActivity(supabase, {
        adminId: auth.admin.id,
        action: "article.generate",
        entityType: "article",
        entityId: retryArticle.id,
      });
      return NextResponse.json({ article: retryArticle });
    }
    return jsonError(insertError?.message ?? "Failed to insert article", 500);
  }

  await supabase.from("topics").update({ status: "generated" }).eq("id", topicId);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "article.generate",
    entityType: "article",
    entityId: article.id,
  });

  return NextResponse.json({ article });
}
