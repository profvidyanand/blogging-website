import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site-config";
import { ensureUniqueSlug, slugify } from "@/lib/slug";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";
import type { Topic } from "@/lib/types";

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
    return jsonError("Article already created for this topic", 400);
  }

  const title = topic.topic.trim();
  const slug = await ensureUniqueSlug(slugify(title), async (candidate) => {
    const { data } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return !!data;
  });

  const authorName = SITE.client.fullName;

  const { data: article, error: insertError } = await supabase
    .from("articles")
    .insert({
      topic_id: topicId,
      category_id: topic.category_id,
      title,
      slug,
      content: "",
      faq: [],
      tags: [],
      author_name: authorName,
      status: "draft",
      created_by: auth.admin.id,
    })
    .select()
    .single();

  if (insertError || !article) {
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
          title,
          slug: retrySlug,
          content: "",
          faq: [],
          tags: [],
          author_name: authorName,
          status: "draft",
          created_by: auth.admin.id,
        })
        .select()
        .single();
      if (retryError || !retryArticle) {
        return jsonError(retryError?.message ?? "Failed to create article", 500);
      }
      await supabase
        .from("topics")
        .update({ status: "generated" })
        .eq("id", topicId);
      await logActivity(supabase, {
        adminId: auth.admin.id,
        action: "article.create",
        entityType: "article",
        entityId: retryArticle.id,
        metadata: { manual: true },
      });
      return NextResponse.json({ article: retryArticle });
    }
    return jsonError(insertError?.message ?? "Failed to create article", 500);
  }

  await supabase.from("topics").update({ status: "generated" }).eq("id", topicId);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "article.create",
    entityType: "article",
    entityId: article.id,
    metadata: { manual: true },
  });

  return NextResponse.json({ article });
}
