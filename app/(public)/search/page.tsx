import { createClient } from "@/lib/supabase/server";
import { BlogCard } from "@/components/public/blog-card";
import { SearchBar } from "@/components/public/search-bar";
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search</h1>
      <SearchBar initialQuery={q} />
      {q.trim() ? (
        <p className="text-sm text-zinc-500">
          {posts.length} result{posts.length === 1 ? "" : "s"} for “{q.trim()}”
        </p>
      ) : (
        <p className="text-zinc-500">Enter a query to search published articles.</p>
      )}
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
    </div>
  );
}
