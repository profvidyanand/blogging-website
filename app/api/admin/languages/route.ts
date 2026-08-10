import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { jsonError, requireAdminApi } from "@/lib/api";
import { ensureUniqueSlug } from "@/lib/slug";
import type { LanguageRow } from "@/lib/languages";

const createSchema = z.object({
  label: z.string().trim().min(1).max(80),
  code: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Code must be lowercase kebab-case")
    .optional(),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("languages")
    .select("*")
    .order("label", { ascending: true });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ languages: (data ?? []) as LanguageRow[] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body");
  }

  const supabase = await createClient();
  const code =
    parsed.data.code ??
    (await ensureUniqueSlug(parsed.data.label, async (candidate) => {
      const { data } = await supabase
        .from("languages")
        .select("code")
        .eq("code", candidate)
        .maybeSingle();
      return !!data;
    }));

  const { data: language, error } = await supabase
    .from("languages")
    .insert({ code, label: parsed.data.label })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return jsonError("A language with this code already exists", 409);
    }
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ language });
}
