import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { getPublicSiteSettings } from "@/lib/public-data";
import type { SocialLinks } from "@/lib/site-config";

export type SiteSettings = SocialLinks;

export async function getSiteSettings(): Promise<SiteSettings> {
  return getPublicSiteSettings();
}

export async function incrementArticleViewCount(slug: string): Promise<void> {
  const supabase = createPublicClient();
  await supabase.rpc("increment_article_view_count", { article_slug: slug });
}
