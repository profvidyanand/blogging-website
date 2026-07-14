import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  scheduledAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
});

export async function POST(request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body");
  }

  const scheduledAt = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    return jsonError("Invalid scheduledAt datetime");
  }
  if (scheduledAt.getTime() <= Date.now()) {
    return jsonError("scheduledAt must be in the future");
  }

  const supabase = await createClient();
  const { data: article, error } = await supabase
    .from("articles")
    .update({
      status: "scheduled",
      scheduled_at: scheduledAt.toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!article) return jsonError("Article not found", 404);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "article.schedule",
    entityType: "article",
    entityId: id,
    metadata: { scheduledAt: scheduledAt.toISOString() },
  });

  return NextResponse.json({ article });
}
