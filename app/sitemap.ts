import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/public-data";
import { SITE } from "@/lib/site-config";

export const revalidate = 54000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, articles } = await getSitemapEntries();
  const base = SITE.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/sitemap`, changeFrequency: "weekly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(a.updated_at ?? a.published_at ?? Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
