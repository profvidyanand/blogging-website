import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site-config";
import type { Article, Category } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const base = SITE.url;

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

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/sitemap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = (
    (categories ?? []) as Pick<Category, "slug" | "updated_at">[]
  ).map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = (
    (articles ?? []) as Pick<Article, "slug" | "updated_at" | "published_at">[]
  ).map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(a.updated_at ?? a.published_at ?? Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
