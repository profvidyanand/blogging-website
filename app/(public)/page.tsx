import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BlogCard } from "@/components/public/blog-card";
import { SearchBar } from "@/components/public/search-bar";
import { Badge } from "@/components/ui/badge";
import type { Article, Category } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: articles }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(12),
  ]);

  const cats = (categories ?? []) as Category[];
  const posts = (articles ?? []) as Article[];
  const catMap = new Map(cats.map((c) => [c.id, c]));

  return (
    <div className="space-y-10">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Discover SEO-ready articles
        </h1>
        <p className="mx-auto max-w-xl text-zinc-600">
          Browse the latest published posts across every category.
        </p>
        <div className="mx-auto max-w-lg">
          <SearchBar />
        </div>
      </section>

      {cats.length > 0 ? (
        <section className="flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`}>
              <Badge variant="secondary" className="cursor-pointer px-3 py-1">
                {c.name}
              </Badge>
            </Link>
          ))}
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Latest articles</h2>
        {posts.length === 0 ? (
          <p className="text-zinc-500">No published articles yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                summary={post.summary}
                featuredImage={post.featured_image}
                categoryName={catMap.get(post.category_id)?.name}
                publishedAt={post.published_at}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
