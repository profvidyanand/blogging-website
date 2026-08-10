import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BlogCard } from "@/components/public/blog-card";
import { CategoryHighlightCard } from "@/components/public/category-highlight-card";
import { CategoryTile } from "@/components/public/category-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCategoryAccent } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import type { Article, Category } from "@/lib/types";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const supabase = await createClient();

  if (query) {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .or(
        `title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`,
      )
      .order("published_at", { ascending: false })
      .limit(24);

    const posts = (data ?? []) as Article[];
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
                categoryName={catMap.get(post.category_id)}
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
      .limit(24),
  ]);

  const cats = (categories ?? []) as Category[];
  const posts = (articles ?? []) as Article[];
  const catMap = new Map(cats.map((c) => [c.id, c]));
  const [featured, ...rest] = posts;
  const featuredCategory = featured
    ? catMap.get(featured.category_id)
    : undefined;
  const featuredAccent = featuredCategory
    ? getCategoryAccent(featuredCategory.name)
    : undefined;

  const latestByCategory = cats
    .map((c) => ({
      category: c,
      article: posts.find((p) => p.category_id === c.id),
    }))
    .filter((entry): entry is { category: Category; article: Article } =>
      Boolean(entry.article),
    )
    .slice(0, 6);

  const latestGrid = rest.slice(0, 9);

  return (
    <div className="space-y-14">
      <section className="space-y-6 text-center">
        <Badge variant="secondary" className="mx-auto">
          Fresh stories updated daily
        </Badge>
        <h1 className="text-display text-foreground">
          Discover insights that matter
        </h1>
        <p className="mx-auto max-w-xl text-body text-muted-foreground">
          Thoughtful articles on spirituality, wisdom, and purposeful living
          &mdash; curated for seekers and lifelong learners.
        </p>
      </section>

      {featured ? (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-h2 text-foreground">Latest story</h2>
            <span className="hidden text-caption sm:inline">
              Our newest publication
            </span>
          </div>
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative block h-[360px] overflow-hidden rounded-2xl border border-border shadow-card transition-shadow hover:shadow-hover sm:h-[440px]"
          >
            {featured.featured_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.featured_image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-background" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-10">
              {featuredCategory ? (
                <Badge className={cn(featuredAccent?.bg, featuredAccent?.text)}>
                  {featuredCategory.name}
                </Badge>
              ) : null}
              <h3 className="max-w-2xl text-2xl font-bold leading-tight text-white sm:text-4xl">
                {featured.title}
              </h3>
              {featured.summary ? (
                <p className="line-clamp-2 max-w-xl text-sm text-white/80 sm:text-base">
                  {featured.summary}
                </p>
              ) : null}
              {featured.published_at ? (
                <time
                  dateTime={featured.published_at}
                  className="text-xs font-medium uppercase tracking-wide text-white/60"
                >
                  {new Date(featured.published_at).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </time>
              ) : null}
            </div>
          </Link>
        </section>
      ) : null}

      {cats.length > 0 ? (
        <section className="flex flex-wrap justify-center gap-2">
          {cats.map((c) => {
            const accent = getCategoryAccent(c.name);
            return (
              <Link key={c.id} href={`/category/${c.slug}`}>
                <Badge
                  variant="secondary"
                  className={`cursor-pointer px-3 py-1.5 transition-transform hover:-translate-y-0.5 ${accent.bg} ${accent.text}`}
                >
                  {c.name}
                </Badge>
              </Link>
            );
          })}
        </section>
      ) : null}

      {latestByCategory.length > 0 ? (
        <section>
          <h2 className="mb-4 text-h2 text-foreground">
            Latest across categories
          </h2>
          <p className="mb-5 -mt-3 text-body-sm text-muted-foreground">
            One fresh story from every section we cover.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestByCategory.map(({ category, article }) => (
              <CategoryHighlightCard
                key={category.id}
                title={article.title}
                slug={article.slug}
                summary={article.summary}
                featuredImage={article.featured_image}
                categoryName={category.name}
                publishedAt={article.published_at}
              />
            ))}
          </div>
        </section>
      ) : null}

      {cats.length > 0 ? (
        <section>
          <h2 className="mb-5 text-h2 text-foreground">Explore categories</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cats.map((c) => (
              <CategoryTile key={c.id} category={c} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-5 text-h2 text-foreground">Latest articles</h2>
        {latestGrid.length === 0 && !featured ? (
          <p className="text-muted-foreground">No published articles yet.</p>
        ) : latestGrid.length === 0 ? (
          <p className="text-muted-foreground">
            No more articles right now &mdash; check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestGrid.map((post) => (
              <BlogCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                summary={post.summary}
                featuredImage={post.featured_image}
                categoryName={catMap.get(post.category_id)?.name}
                publishedAt={post.published_at}
                viewCount={post.view_count ?? 0}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
