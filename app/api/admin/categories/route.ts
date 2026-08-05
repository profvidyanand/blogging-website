import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { ensureUniqueSlug } from "@/lib/slug";
import { jsonError, requireAdminApi } from "@/lib/api";
import { DEFAULT_LANGUAGE } from "@/lib/types";

const languageSchema = z.enum([
  "english",
  "hindi",
  "sanskrit",
  "marathi",
  "gujarati",
]);

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  language: languageSchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body");
  }

  const { name, description, language = DEFAULT_LANGUAGE, status = "active" } =
    parsed.data;
  const admin = createAdminClient();

  const slug = await ensureUniqueSlug(name, async (candidate) => {
    const { data } = await admin
      .from("categories")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return !!data;
  });

  const { data: category, error: catError } = await admin
    .from("categories")
    .insert({
      name,
      slug,
      description: description ?? null,
      language,
      status,
      created_by: auth.admin.id,
    })
    .select()
    .single();

  if (catError || !category) {
    return jsonError(catError?.message ?? "Failed to create category", 500);
  }

  const { error: assignError } = await admin.from("category_assignments").insert({
    category_id: category.id,
    admin_id: auth.admin.id,
  });

  if (assignError) {
    await admin.from("categories").delete().eq("id", category.id);
    return jsonError(assignError.message, 500);
  }

  const sessionClient = await createClient();
  await logActivity(sessionClient, {
    adminId: auth.admin.id,
    action: "category.create",
    entityType: "category",
    entityId: category.id,
    metadata: { name, slug, language },
  });

  return NextResponse.json({ category });
}
