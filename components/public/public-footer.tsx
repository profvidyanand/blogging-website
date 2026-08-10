import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SocialLinksRow } from "@/components/public/social-links-row";
import { SITE } from "@/lib/site-config";
import type { SocialLinks } from "@/lib/site-config";
import type { Category } from "@/lib/types";

export function PublicFooter({
  categories,
  socialLinks,
}: {
  categories: Category[];
  socialLinks: SocialLinks;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="dark mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="size-4" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-body-sm leading-relaxed text-muted-foreground">
              {SITE.tagline}
            </p>
            <SocialLinksRow links={socialLinks} className="mt-5" />
          </div>

          <div>
            <h3 className="text-body-sm font-semibold text-foreground">
              Categories
            </h3>
            {categories.length > 0 ? (
              <ul className="mt-4 space-y-2.5">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/category/${c.slug}`}
                      className="text-body-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-body-sm text-muted-foreground">
                Categories coming soon.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-body-sm font-semibold text-foreground">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-body-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-body-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-body-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-body-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-body-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-caption">
            &copy; {year} {SITE.name}. All rights reserved.
          </p>
          <p className="text-caption">
            <a
              href={`mailto:${SITE.email}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {SITE.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
