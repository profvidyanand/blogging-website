import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogCard } from "@/components/public/blog-card";
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{cat.name}</h1>
        {cat.description ? (
          <p className="mt-2 text-zinc-600">{cat.description}</p>
        ) : null}
      </header>

      {posts.length === 0 ? (
        <p className="text-zinc-500">No published articles in this category.</p>
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
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="flex justify-center gap-2 text-sm">
          {page > 1 ? (
            <a href={`/category/${slug}?page=${page - 1}`} className="underline">
              Previous
            </a>
          ) : null}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <a href={`/category/${slug}?page=${page + 1}`} className="underline">
              Next
            </a>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
