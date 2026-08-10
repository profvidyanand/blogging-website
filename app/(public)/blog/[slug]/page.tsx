import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eye, Mail, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
import type { Article, Category, FaqItem } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, seo_title, meta_description, summary")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return { title: "Article" };
  const a = data as Pick<
    Article,
    "title" | "seo_title" | "meta_description" | "summary"
  >;
  return {
    title: a.seo_title || a.title,
    description: a.meta_description || a.summary || undefined,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!article) notFound();
  const post = article as Article;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", post.category_id)
    .maybeSingle();

  const cat = category as Category | null;

  const { data: related } = await supabase
    .from("articles")
    .select("*")
    .eq("category_id", post.category_id)
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const faq = (Array.isArray(post.faq) ? post.faq : []) as FaqItem[];
  const shareUrl = `${SITE.url}/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);
  const viewCount = post.view_count ?? 0;

  return (
    <article className="blog-article mx-auto max-w-3xl space-y-8">
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
        {cat ? (
          <Link
            href={`/category/${cat.slug}`}
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-80",
              getCategoryAccent(cat.name).bg,
              getCategoryAccent(cat.name).text
            )}
          >
            {cat.name}
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
          {post.author_name ? (
            <span>{post.author_name}</span>
          ) : null}
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

      {(related ?? []).length > 0 ? (
        <section className="space-y-4 border-t border-border pt-8">
          <h2 className="text-h2">Related articles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(related as Article[]).map((r) => (
              <BlogCard
                key={r.id}
                title={r.title}
                slug={r.slug}
                summary={r.summary}
                featuredImage={r.featured_image}
                categoryName={cat?.name}
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
