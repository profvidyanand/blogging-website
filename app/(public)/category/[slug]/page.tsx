import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogCard } from "@/components/public/blog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { getCategoryAccent } from "@/lib/category-colors";
import type { Article, Category } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!category) notFound();
  const cat = category as Category;

  const { data: articles, count } = await supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("category_id", cat.id)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  const posts = (articles ?? []) as Article[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const accent = getCategoryAccent(cat.name);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-background px-6 py-8 sm:px-8">
        <Badge className={`${accent.bg} ${accent.text}`}>Category</Badge>
        <h1 className="mt-3 text-h1">{cat.name}</h1>
        <p className="mt-2 text-caption">
          {count ?? 0} article{(count ?? 0) === 1 ? "" : "s"}
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
              href={`/category/${slug}?page=${page - 1}`}
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
              href={`/category/${slug}?page=${page + 1}`}
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
