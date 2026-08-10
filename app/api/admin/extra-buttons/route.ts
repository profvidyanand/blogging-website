import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { jsonError, requireAdminApi } from "@/lib/api";
import { revalidatePublicContent } from "@/lib/revalidate-public";
import {
  EXTRA_BUTTONS_COUNT,
  normalizeExtraButtons,
} from "@/lib/site-config";

const urlField = z
  .string()
  .max(500)
  .refine(
    (v) => v === "" || /^https?:\/\/.+/i.test(v),
    "Must be a valid URL starting with http:// or https://",
  );

const buttonSchema = z.object({
  name: z.string().max(100),
  url: urlField,
});

const updateSchema = z.object({
  buttons: z.array(buttonSchema).length(EXTRA_BUTTONS_COUNT),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("extra_buttons")
    .eq("id", 1)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({
    buttons: normalizeExtraButtons(data?.extra_buttons),
  });
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update({ extra_buttons: parsed.data.buttons })
    .eq("id", 1)
    .select("extra_buttons")
    .single();

  if (error) return jsonError(error.message, 500);

  revalidatePublicContent();

  return NextResponse.json({
    buttons: normalizeExtraButtons(data.extra_buttons),
  });
}
