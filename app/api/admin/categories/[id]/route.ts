import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { ensureUniqueSlug } from "@/lib/slug";
import { jsonError, requireAdminApi } from "@/lib/api";
import { languageExists } from "@/lib/languages";
import type { Database } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  language: z.string().min(1).max(80).optional(),
  status: z.enum(["active", "inactive"]).optional(),
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
  const updates: CategoryUpdate = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) {
    updates.description = parsed.data.description;
  }
  if (parsed.data.language !== undefined) {
    if (!(await languageExists(supabase, parsed.data.language))) {
      return jsonError("Invalid language", 400);
    }
    updates.language = parsed.data.language;
  }
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  if (parsed.data.name) {
    updates.slug = await ensureUniqueSlug(parsed.data.name, async (candidate) => {
      const { data } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", candidate)
        .neq("id", id)
        .maybeSingle();
      return !!data;
    });
  }

  const { data: category, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!category) return jsonError("Category not found", 404);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "category.update",
    entityType: "category",
    entityId: id,
    metadata: { ...updates },
  });

  return NextResponse.json({ category });
}

export async function DELETE(_request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return jsonError(error.message, 500);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "category.delete",
    entityType: "category",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
