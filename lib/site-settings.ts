import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SOCIAL_LINKS,
  type SocialLinks,
} from "@/lib/site-config";

export type SiteSettings = SocialLinks;

function mapRow(row: {
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
}): SiteSettings {
  return {
    facebook: row.facebook_url,
    instagram: row.instagram_url,
    twitter: row.twitter_url,
    youtube: row.youtube_url,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("facebook_url, instagram_url, twitter_url, youtube_url")
    .eq("id", 1)
    .maybeSingle();

  if (!data) return DEFAULT_SOCIAL_LINKS;
  return mapRow(data);
}

export async function incrementArticleViewCount(slug: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("increment_article_view_count", { article_slug: slug });
}
