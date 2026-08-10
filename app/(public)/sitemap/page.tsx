import type { Metadata } from "next";
import Link from "next/link";
import { getSitemapPageData } from "@/lib/public-data";
import { SITE } from "@/lib/site-config";

export const revalidate = 54000;

export const metadata: Metadata = {
  title: "Sitemap",
  description: `Browse all pages and articles on ${SITE.name}.`,
};

export default async function SitemapPage() {
  const { categories: cats, articles: posts } = await getSitemapPageData();

  const staticPages = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-display text-foreground">Sitemap</h1>
        <p className="text-body text-muted-foreground">
          A complete index of pages and articles on {SITE.name}.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-h2 text-foreground">Pages</h2>
        <ul className="space-y-2">
          {staticPages.map((page) => (
            <li key={page.href}>
              <Link
                href={page.href}
                prefetch={false}
                className="text-body text-primary hover:underline"
              >
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {cats.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-h2 text-foreground">Categories</h2>
          <ul className="space-y-2">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  prefetch={false}
                  className="text-body text-primary hover:underline"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-h2 text-foreground">Articles</h2>
        {posts.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">
            No published articles yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  prefetch={false}
                  className="text-body text-primary hover:underline"
                >
                  {post.title}
                </Link>
                {post.published_at ? (
                  <span className="ml-2 text-caption text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
