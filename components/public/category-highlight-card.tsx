import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCategoryAccent } from "@/lib/category-colors";

export type CategoryHighlightCardProps = {
  title: string;
  slug: string;
  summary?: string | null;
  featuredImage?: string | null;
  categoryName: string;
  publishedAt?: string | null;
  className?: string;
};

/** Compact horizontal card used in the "Latest across categories" grid. */
export function CategoryHighlightCard({
  title,
  slug,
  summary,
  featuredImage,
  categoryName,
  publishedAt,
  className,
}: CategoryHighlightCardProps) {
  const accent = getCategoryAccent(categoryName);

  return (
    <article
      className={cn(
        "group flex gap-4 rounded-xl border border-border bg-card p-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover",
        className
      )}
    >
      <Link
        href={`/blog/${slug}`}
        prefetch={false}
        className="block size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28"
      >
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-caption">
            No image
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <Badge variant="secondary" className={cn("self-start", accent.bg, accent.text)}>
          {categoryName}
        </Badge>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          <Link href={`/blog/${slug}`} prefetch={false} className="hover:text-primary">
            {title}
          </Link>
        </h3>
        {summary ? (
          <p className="line-clamp-1 text-caption">{summary}</p>
        ) : null}
        {publishedAt ? (
          <time dateTime={publishedAt} className="mt-auto text-caption">
            {new Date(publishedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        ) : null}
      </div>
    </article>
  );
}
