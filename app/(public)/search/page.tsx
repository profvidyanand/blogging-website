import { createClient } from "@/lib/supabase/server";
import { BlogCard } from "@/components/public/blog-card";
import { SearchBar } from "@/components/public/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";
import type { Article, Category } from "@/lib/types";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  let posts: Article[] = [];
  if (q.trim()) {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .or(
        `title.ilike.%${q.trim()}%,summary.ilike.%${q.trim()}%,content.ilike.%${q.trim()}%`,
      )
      .order("published_at", { ascending: false })
      .limit(24);
    posts = (data ?? []) as Article[];
  }

  const categoryIds = [...new Set(posts.map((p) => p.category_id))];
  let catMap = new Map<string, string>();
  if (categoryIds.length) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name")
      .in("id", categoryIds);
    catMap = new Map(
      ((cats ?? []) as Pick<Category, "id" | "name">[]).map((c) => [
        c.id,
        c.name,
      ]),
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 text-center">
        <h1 className="text-h1">Search</h1>
        <p className="text-body text-muted-foreground">
          Find published articles across all categories.
        </p>
        <div className="mx-auto max-w-xl">
          <SearchBar initialQuery={q} />
        </div>
      </section>

      {q.trim() ? (
        <p className="text-body-sm text-muted-foreground">
          <span className="font-medium text-foreground">{posts.length}</span>{" "}
          result{posts.length === 1 ? "" : "s"} for &ldquo;{q.trim()}&rdquo;
        </p>
      ) : (
        <p className="text-center text-muted-foreground">
          Enter a query to search published articles.
        </p>
      )}

      {q.trim() && posts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`We couldn't find any articles matching "${q.trim()}".`}
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
              categoryName={catMap.get(post.category_id)}
              publishedAt={post.published_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
