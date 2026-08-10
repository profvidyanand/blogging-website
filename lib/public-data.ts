import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-config";
import { createPublicClient } from "@/lib/supabase/public";
import {
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_EXTRA_BUTTONS,
  normalizeExtraButtons,
  type SocialLinks,
  type ExtraButton,
} from "@/lib/site-config";
import type { Article, Category } from "@/lib/types";

function mapSiteSettings(row: {
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  linkedin_url: string;
}): SocialLinks {
  return {
    facebook: row.facebook_url,
    instagram: row.instagram_url,
    twitter: row.twitter_url,
    youtube: row.youtube_url,
    linkedin: row.linkedin_url,
  };
}

export async function getActiveCategories(): Promise<Category[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("status", "active")
        .order("name");

      return (data ?? []) as Category[];
    },
    ["active-categories"],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["categories"],
    },
  )();
}

export async function getPublicSiteSettings(): Promise<SocialLinks> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("site_settings")
        .select(
          "facebook_url, instagram_url, twitter_url, youtube_url, linkedin_url",
        )
        .eq("id", 1)
        .maybeSingle();

      if (!data) return DEFAULT_SOCIAL_LINKS;
      return mapSiteSettings(data);
    },
    ["site-settings"],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["site-settings"],
    },
  )();
}

export async function getPublicExtraButtons(): Promise<ExtraButton[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("site_settings")
        .select("extra_buttons")
        .eq("id", 1)
        .maybeSingle();

      if (!data) return DEFAULT_EXTRA_BUTTONS;
      return normalizeExtraButtons(data.extra_buttons);
    },
    ["extra-buttons"],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["extra-buttons"],
    },
  )();
}

export async function getHomePageArticles(): Promise<Article[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(24);

      return (data ?? []) as Article[];
    },
    ["home-articles"],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["home", "articles"],
    },
  )();
}

export const getPublishedArticleBySlug = cache(async (slug: string) => {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      return (data as Article | null) ?? null;
    },
    ["published-article", slug],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [`article:${slug}`, "articles"],
    },
  )();
});

export async function getCategoryById(id: string): Promise<Category | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      return (data as Category | null) ?? null;
    },
    ["category-by-id", id],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["categories"],
    },
  )();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();

      return (data as Category | null) ?? null;
    },
    ["category-by-slug", slug],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [`category:${slug}`, "categories"],
    },
  )();
}

export async function getCategoryArticles(
  categoryId: string,
  categorySlug: string,
  page: number,
  pageSize = 12,
): Promise<{ posts: Article[]; totalCount: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data, count } = await supabase
        .from("articles")
        .select("*", { count: "exact" })
        .eq("category_id", categoryId)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(from, to);

      return {
        posts: (data ?? []) as Article[],
        totalCount: count ?? 0,
      };
    },
    ["category-articles", categoryId, String(page), String(pageSize)],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [`category:${categorySlug}`, "articles"],
    },
  )();
}

export async function getRelatedArticles(
  categoryId: string,
  excludeArticleId: string,
  articleSlug: string,
): Promise<Article[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("category_id", categoryId)
        .eq("status", "published")
        .neq("id", excludeArticleId)
        .order("published_at", { ascending: false })
        .limit(3);

      return (data ?? []) as Article[];
    },
    ["related-articles", categoryId, excludeArticleId],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [`article:${articleSlug}`, "articles"],
    },
  )();
}

export async function getSitemapEntries(): Promise<{
  categories: Pick<Category, "slug" | "updated_at">[];
  articles: Pick<Article, "slug" | "updated_at" | "published_at">[];
}> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const [{ data: categories }, { data: articles }] = await Promise.all([
        supabase
          .from("categories")
          .select("slug, updated_at")
          .eq("status", "active"),
        supabase
          .from("articles")
          .select("slug, updated_at, published_at")
          .eq("status", "published"),
      ]);

      return {
        categories: (categories ?? []) as Pick<
          Category,
          "slug" | "updated_at"
        >[],
        articles: (articles ?? []) as Pick<
          Article,
          "slug" | "updated_at" | "published_at"
        >[],
      };
    },
    ["sitemap-entries"],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["sitemap", "categories", "articles"],
    },
  )();
}

export async function getSitemapPageData(): Promise<{
  categories: Pick<Category, "name" | "slug">[];
  articles: Pick<Article, "title" | "slug" | "published_at">[];
}> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const [{ data: categories }, { data: articles }] = await Promise.all([
        supabase
          .from("categories")
          .select("name, slug")
          .eq("status", "active")
          .order("name"),
        supabase
          .from("articles")
          .select("title, slug, published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false }),
      ]);

      return {
        categories: (categories ?? []) as Pick<Category, "name" | "slug">[],
        articles: (articles ?? []) as Pick<
          Article,
          "title" | "slug" | "published_at"
        >[],
      };
    },
    ["sitemap-page-data"],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: ["sitemap", "categories", "articles"],
    },
  )();
}

export async function searchPublishedArticles(
  query: string,
): Promise<{ posts: Article[]; categoryNames: Map<string, string> }> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .or(
      `title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`,
    )
    .order("published_at", { ascending: false })
    .limit(24);

  const posts = (data ?? []) as Article[];
  const categoryIds = [...new Set(posts.map((p) => p.category_id))];
  let categoryNames = new Map<string, string>();

  if (categoryIds.length) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name")
      .in("id", categoryIds);

    categoryNames = new Map(
      ((cats ?? []) as Pick<Category, "id" | "name">[]).map((c) => [
        c.id,
        c.name,
      ]),
    );
  }

  return { posts, categoryNames };
}
