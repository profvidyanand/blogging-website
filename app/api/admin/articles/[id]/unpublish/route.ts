import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .update({
      status: "unpublished",
      scheduled_at: null,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!article) return jsonError("Article not found", 404);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "article.unpublish",
    entityType: "article",
    entityId: id,
  });

  return NextResponse.json({ article });
}
