import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eye, Mail, Share2 } from "lucide-react";
import {
  getCategoryById,
  getPublishedArticleBySlug,
  getRelatedArticles,
} from "@/lib/public-data";
import { BlogCard } from "@/components/public/blog-card";
import { ArticleViewTracker } from "@/components/public/article-view-tracker";
import { AudioPlayer } from "@/components/public/audio-player";
import { BlogArticleContent } from "@/components/public/blog-article-content";
import { BlogArticleFaq } from "@/components/public/blog-article-faq";
import { buttonVariants } from "@/components/ui/button";
import { getCategoryAccent } from "@/lib/category-colors";
import { formatViewCount } from "@/lib/format-view-count";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/types";

export const revalidate = 54000;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) return { title: "Article" };

  return {
    title: article.seo_title || article.title,
    description: article.meta_description || article.summary || undefined,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedArticleBySlug(slug);

  if (!post) notFound();

  const [category, related] = await Promise.all([
    getCategoryById(post.category_id),
    getRelatedArticles(post.category_id, post.id, post.slug),
  ]);

  const faq = (Array.isArray(post.faq) ? post.faq : []) as FaqItem[];
  const shareUrl = `${SITE.url}/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);
  const viewCount = post.view_count ?? 0;

  return (
    <article className="blog-article w-full space-y-8">
      <ArticleViewTracker slug={post.slug} />
      {post.featured_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featured_image}
          alt=""
          className="aspect-[2/1] w-full rounded-2xl object-cover shadow-card"
        />
      ) : null}

      <header className="blog-article-header space-y-4">
        {category ? (
          <Link
            href={`/category/${category.slug}`}
            prefetch={false}
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80",
              getCategoryAccent(category.name).bg,
              getCategoryAccent(category.name).text,
            )}
          >
            {category.name}
          </Link>
        ) : null}
        <h1 className="blog-article-title">{post.title}</h1>
        {post.summary ? (
          <p className="blog-article-lead">{post.summary}</p>
        ) : null}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-muted-foreground">
          {post.published_at ? (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          ) : null}
          {post.author_name ? <span>{post.author_name}</span> : null}
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" aria-hidden />
            {formatViewCount(viewCount)}
          </span>
        </div>
        {post.featured_image_credit ? (
          <p className="text-caption">{post.featured_image_credit}</p>
        ) : null}
        <AudioPlayer title={post.title} />
      </header>

      <BlogArticleContent html={post.content} />

      <BlogArticleFaq items={faq} />

      <section className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <span className="flex items-center gap-1.5 text-body-sm font-medium">
          <Share2 className="size-4" />
          Share
        </span>
        <a
          href={`mailto:?subject=${shareText}&body=${encodeURIComponent(shareUrl)}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Mail className="size-4" />
          Email
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          X / Twitter
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          LinkedIn
        </a>
      </section>

      {related.length > 0 ? (
        <section className="space-y-4 border-t border-border pt-8">
          <h2 className="text-h2">Related articles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <BlogCard
                key={r.id}
                title={r.title}
                slug={r.slug}
                summary={r.summary}
                featuredImage={r.featured_image}
                categoryName={category?.name}
                publishedAt={r.published_at}
                viewCount={r.view_count ?? 0}
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
