import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  topic: z.string().min(1).max(500),
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
  const { data: topic, error } = await supabase
    .from("topics")
    .update({ topic: parsed.data.topic })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!topic) return jsonError("Topic not found", 404);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "topic.update",
    entityType: "topic",
    entityId: id,
  });

  return NextResponse.json({ topic });
}

export async function DELETE(_request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const supabase = await createClient();

  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "topic.delete",
    entityType: "topic",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
