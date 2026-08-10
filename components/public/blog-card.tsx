import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCategoryAccent } from "@/lib/category-colors";
import { formatViewCount } from "@/lib/format-view-count";

export type BlogCardProps = {
  title: string;
  slug: string;
  summary?: string | null;
  featuredImage?: string | null;
  categoryName?: string | null;
  publishedAt?: string | null;
  viewCount?: number;
  href?: string;
  className?: string;
};

function estimateReadTime(summary?: string | null) {
  if (!summary) return null;
  const words = summary.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function BlogCard({
  title,
  slug,
  summary,
  featuredImage,
  categoryName,
  publishedAt,
  viewCount,
  href,
  className,
}: BlogCardProps) {
  const link = href ?? `/blog/${slug}`;
  const readTime = estimateReadTime(summary);
  const accent = categoryName ? getCategoryAccent(categoryName) : null;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover",
        className
      )}
    >
      <Link
        href={link}
        className="block aspect-[16/10] overflow-hidden bg-muted"
      >
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-caption">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-caption">
          {categoryName ? (
            <Badge
              variant="secondary"
              className={cn(accent?.bg, accent?.text)}
            >
              {categoryName}
            </Badge>
          ) : null}
          {publishedAt ? (
            <time dateTime={publishedAt}>
              {new Date(publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          ) : null}
          {readTime ? <span>{readTime}</span> : null}
          {viewCount != null ? (
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" aria-hidden />
              {formatViewCount(viewCount)}
            </span>
          ) : null}
        </div>
        <h2 className="text-lg font-semibold leading-snug text-foreground">
          <Link href={link} className="hover:text-primary">
            {title}
          </Link>
        </h2>
        {summary ? (
          <p className="line-clamp-3 text-body-sm text-muted-foreground">
            {summary}
          </p>
        ) : null}
        <Link
          href={link}
          className="mt-auto flex items-center gap-1 pt-2 text-body-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Read more <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
