import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { jsonError, requireAdminApi } from "@/lib/api";
import { revalidatePublicContent } from "@/lib/revalidate-public";

const urlField = z
  .string()
  .max(500)
  .refine(
    (v) => v === "" || /^https?:\/\/.+/i.test(v),
    "Must be a valid URL starting with http:// or https://",
  );

const updateSchema = z.object({
  facebook: urlField,
  instagram: urlField,
  twitter: urlField,
  youtube: urlField,
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({
    settings: {
      facebook: data?.facebook_url ?? "",
      instagram: data?.instagram_url ?? "",
      twitter: data?.twitter_url ?? "",
      youtube: data?.youtube_url ?? "",
    },
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

  const { facebook, instagram, twitter, youtube } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      facebook_url: facebook,
      instagram_url: instagram,
      twitter_url: twitter,
      youtube_url: youtube,
    })
    .eq("id", 1)
    .select("*")
    .single();

  if (error) return jsonError(error.message, 500);

  revalidatePublicContent();

  return NextResponse.json({
    settings: {
      facebook: data.facebook_url,
      instagram: data.instagram_url,
      twitter: data.twitter_url,
      youtube: data.youtube_url,
    },
  });
}
