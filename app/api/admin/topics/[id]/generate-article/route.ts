import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateArticle } from "@/lib/ai";
import { searchImage, trackDownload } from "@/lib/unsplash";
import { ensureUniqueSlug } from "@/lib/slug";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";
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
    generated = await generateArticle({
      topic: topic.topic,
      categoryName: category.name,
    });
  } catch (err) {
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

  try {
    const photo = await searchImage(topic.topic);
    if (photo) {
      await trackDownload(photo);
      featuredImage = photo.url;
      featuredImageCredit = photo.credit;
    }
  } catch (err) {
    console.error("Image pipeline failed (continuing without image):", err);
  }

  const { data: adminProfile } = await supabase
    .from("admins")
    .select("full_name, email")
    .eq("id", auth.admin.id)
    .maybeSingle();

  const authorName =
    (adminProfile as { full_name: string | null; email: string } | null)
      ?.full_name ||
    auth.admin.fullName ||
    auth.admin.email;

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
      content: generated.content,
      faq,
      tags: generated.tags,
      featured_image: featuredImage,
      featured_image_credit: featuredImageCredit,
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
          content: generated.content,
          faq,
          tags: generated.tags,
          featured_image: featuredImage,
          featured_image_credit: featuredImageCredit,
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
