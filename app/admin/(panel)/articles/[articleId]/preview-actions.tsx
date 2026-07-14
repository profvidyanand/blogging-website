"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScheduleDialog } from "@/components/admin/schedule-dialog";
import { BlogArticleContent } from "@/components/public/blog-article-content";
import { BlogArticleFaq } from "@/components/public/blog-article-faq";
import type { Article, Category, FaqItem } from "@/lib/types";

export function ArticlePreviewActions({
  article,
  category,
}: {
  article: Article;
  category: Category | null;
}) {
  const router = useRouter();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSeo, setShowSeo] = useState(false);

  async function publish() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function unpublish() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/unpublish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unpublish failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function schedule(iso: string) {
    const res = await fetch(`/api/admin/articles/${article.id}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: iso }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Schedule failed");
    router.refresh();
  }

  const faq = (Array.isArray(article.faq) ? article.faq : []) as FaqItem[];
  const statusVariant = useMemo(() => {
    switch (article.status) {
      case "published":
        return "default" as const;
      case "scheduled":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  }, [article.status]);

  return (
    <div className="space-y-8">
      {/* Admin toolbar */}
      <div className="sticky top-0 z-10 -mx-1 rounded-xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/articles"
            className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            ← Back
          </Link>
          <Link
            href={`/admin/articles/${article.id}/edit`}
            className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Edit
          </Link>
          <div className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block" />
          {article.status === "published" ? (
            <Button onClick={unpublish} disabled={loading} size="sm">
              Unpublish
            </Button>
          ) : article.status === "scheduled" ? (
            <span className="text-sm text-zinc-600">
              Scheduled for{" "}
              {article.scheduled_at
                ? new Date(article.scheduled_at).toLocaleString()
                : "—"}
            </span>
          ) : (
            <Button onClick={publish} disabled={loading} size="sm">
              Publish
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScheduleOpen(true)}
          >
            Schedule
          </Button>
          <Badge variant={statusVariant} className="ml-auto capitalize">
            {article.status}
          </Badge>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      {/* Article preview — mirrors public blog layout */}
      <div className="blog-article mx-auto max-w-3xl">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {article.featured_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.featured_image}
              alt=""
              className="aspect-[2/1] w-full object-cover"
            />
          ) : null}

          <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
            <header className="blog-article-header space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {category ? (
                  <Badge variant="secondary" className="font-medium">
                    {category.name}
                  </Badge>
                ) : null}
                {article.tags?.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="blog-article-title">{article.title}</h1>

              {article.summary ? (
                <p className="blog-article-lead">{article.summary}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                {article.author_name ? (
                  <span>By {article.author_name}</span>
                ) : null}
                {article.published_at ? (
                  <time dateTime={article.published_at}>
                    {new Date(article.published_at).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </time>
                ) : (
                  <span>Draft preview</span>
                )}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                  /{article.slug}
                </code>
              </div>

              {article.featured_image_credit ? (
                <p className="text-xs text-zinc-400">
                  {article.featured_image_credit}
                </p>
              ) : null}
            </header>

            {/* SEO panel (admin only) */}
            {(article.seo_title || article.meta_description) ? (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80">
                <button
                  type="button"
                  onClick={() => setShowSeo((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  <span>SEO metadata</span>
                  <span className="text-zinc-400">{showSeo ? "▴" : "▾"}</span>
                </button>
                {showSeo ? (
                  <div className="space-y-2 border-t border-zinc-200 px-4 py-3 text-sm text-zinc-600">
                    {article.seo_title ? (
                      <p>
                        <span className="font-medium text-zinc-800">
                          Meta title:{" "}
                        </span>
                        {article.seo_title}
                      </p>
                    ) : null}
                    {article.meta_description ? (
                      <p>
                        <span className="font-medium text-zinc-800">
                          Meta description:{" "}
                        </span>
                        {article.meta_description}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <BlogArticleContent html={article.content} />

            <BlogArticleFaq items={faq} />
          </div>
        </article>
      </div>

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onSchedule={schedule}
      />
    </div>
  );
}
