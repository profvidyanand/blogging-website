import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";
import { revalidatePublicContent } from "@/lib/revalidate-public";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      scheduled_at: null,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!article) return jsonError("Article not found", 404);

  const { data: category } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", article.category_id)
    .maybeSingle();

  revalidatePublicContent({
    articleSlug: article.slug,
    categorySlug: category?.slug,
  });

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "article.publish",
    entityType: "article",
    entityId: id,
  });

  return NextResponse.json({ article });
}
