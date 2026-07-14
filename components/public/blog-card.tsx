import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export type BlogCardProps = {
  title: string;
  slug: string;
  summary?: string | null;
  featuredImage?: string | null;
  categoryName?: string | null;
  publishedAt?: string | null;
  href?: string;
};

export function BlogCard({
  title,
  slug,
  summary,
  featuredImage,
  categoryName,
  publishedAt,
  href,
}: BlogCardProps) {
  const link = href ?? `/blog/${slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={link} className="block aspect-[16/9] overflow-hidden bg-zinc-100">
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {categoryName ? <Badge variant="secondary">{categoryName}</Badge> : null}
          {publishedAt ? (
            <time dateTime={publishedAt}>
              {new Date(publishedAt).toLocaleDateString()}
            </time>
          ) : null}
        </div>
        <h2 className="text-lg font-semibold leading-snug">
          <Link href={link} className="hover:underline">
            {title}
          </Link>
        </h2>
        {summary ? (
          <p className="line-clamp-3 text-sm text-zinc-600">{summary}</p>
        ) : null}
        <Link
          href={link}
          className="mt-auto pt-2 text-sm font-medium text-zinc-900 hover:underline"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
