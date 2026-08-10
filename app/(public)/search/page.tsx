import Link from "next/link";
import { searchPublishedArticles } from "@/lib/public-data";
import { BlogCard } from "@/components/public/blog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  if (!query) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-h1 text-foreground">Search</h1>
        <p className="text-body-sm text-muted-foreground">
          Enter a search term using the search box in the header.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const { posts, categoryNames } = await searchPublishedArticles(query);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-h1 text-foreground">Search results</h1>
        <p className="text-body-sm text-muted-foreground">
          <span className="font-medium text-foreground">{posts.length}</span>{" "}
          result{posts.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </p>
      </section>

      {posts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`We couldn't find any articles matching "${query}".`}
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
              categoryName={categoryNames.get(post.category_id)}
              publishedAt={post.published_at}
              viewCount={post.view_count ?? 0}
            />
          ))}
        </div>
      )}

      <p className="text-center text-body-sm text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
