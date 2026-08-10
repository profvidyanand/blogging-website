import Link from "next/link";
import { BlogCard } from "@/components/public/blog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FileText } from "lucide-react";
import type { getCategoryAccent } from "@/lib/category-colors";
import type { Article, Category } from "@/lib/types";

type Props = {
  cat: Pick<Category, "name" | "slug">;
  posts: Article[];
  totalCount: number;
  page: number;
  totalPages: number;
  accent: ReturnType<typeof getCategoryAccent>;
};

export function CategoryArticlesView({
  cat,
  posts,
  totalCount,
  page,
  totalPages,
  accent,
}: Props) {
  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-background px-6 py-8 sm:px-8">
        <Badge className={`${accent.bg} ${accent.text}`}>Category</Badge>
        <h1 className="mt-3 text-h1">{cat.name}</h1>
        <p className="mt-2 text-caption">
          {totalCount} article{totalCount === 1 ? "" : "s"}
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No articles yet"
          description="No published articles in this category."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              summary={post.summary}
              featuredImage={post.featured_image}
              categoryName={cat.name}
              publishedAt={post.published_at}
              viewCount={post.view_count ?? 0}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={
                page === 2
                  ? `/category/${cat.slug}`
                  : `/category/${cat.slug}/page/${page - 1}`
              }
              prefetch={false}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Previous
            </Link>
          ) : null}
          <span className="text-body-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/category/${cat.slug}/page/${page + 1}`}
              prefetch={false}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
