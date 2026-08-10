"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/admin/status-badge";
import { BlogArticleContent } from "@/components/public/blog-article-content";
import { BlogArticleFaq } from "@/components/public/blog-article-faq";
import { LoadingLabel } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";
import type { Article, Category, FaqItem } from "@/lib/types";

export function ArticlePreviewActions({
  article,
  category,
}: {
  article: Article;
  category: Category | null;
}) {
  const router = useRouter();
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
      toast.success("Article published");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setError(msg);
      toast.error(msg);
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
      toast.success("Article unpublished");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const faq = (Array.isArray(article.faq) ? article.faq : []) as FaqItem[];

  return (
    <div className="space-y-8">
      <div className="sticky top-14 z-10 -mx-1 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-card backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/articles"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ← Back
          </Link>
          <Link
            href={`/admin/articles/${article.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Edit
          </Link>
          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
          {article.status === "published" ? (
            <Button onClick={unpublish} disabled={loading} size="sm">
              <LoadingLabel
                loading={loading}
                label="Unpublish"
                loadingLabel="Unpublishing…"
              />
            </Button>
          ) : (
            <Button onClick={publish} disabled={loading} size="sm">
              <LoadingLabel
                loading={loading}
                label="Publish"
                loadingLabel="Publishing…"
              />
            </Button>
          )}
          <div className="ml-auto">
            <StatusBadge status={article.status} />
          </div>
        </div>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="blog-article w-full">
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
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
              <div className="flex flex-wrap items-center gap-2 text-body-sm">
                {category ? (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {category.name}
                  </span>
                ) : null}
                {article.tags?.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="blog-article-title">{article.title}</h1>

              {article.summary ? (
                <p className="blog-article-lead">{article.summary}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-muted-foreground">
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
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  /{article.slug}
                </code>
              </div>

              {article.featured_image_credit ? (
                <p className="text-caption">{article.featured_image_credit}</p>
              ) : null}
            </header>

            {(article.seo_title || article.meta_description) ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30">
                <button
                  type="button"
                  onClick={() => setShowSeo((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-body-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>SEO metadata</span>
                  <span>{showSeo ? "▴" : "▾"}</span>
                </button>
                {showSeo ? (
                  <div className="space-y-2 border-t border-border px-4 py-3 text-body-sm text-muted-foreground">
                    {article.seo_title ? (
                      <p>
                        <span className="font-medium text-foreground">
                          Meta title:{" "}
                        </span>
                        {article.seo_title}
                      </p>
                    ) : null}
                    {article.meta_description ? (
                      <p>
                        <span className="font-medium text-foreground">
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
    </div>
  );
}
