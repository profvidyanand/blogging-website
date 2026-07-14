"use client";

import Link from "next/link";
import { Globe, Mail, MessageCircle, Rss, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/types";

const socialLinks = [
  { label: "RSS feed", icon: Rss, href: "#" },
  { label: "Email us", icon: Mail, href: "#" },
  { label: "Community", icon: MessageCircle, href: "#" },
  { label: "Website", icon: Globe, href: "#" },
];

export function PublicFooter({ categories }: { categories: Category[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="dark mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                AI Blog Platform
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-body-sm leading-relaxed text-muted-foreground">
              Your trusted source for AI-assisted, SEO-ready articles &mdash;
              covering every category with fresh stories published
              regularly.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
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
                  href="/search"
                  className="text-body-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-body-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-body-sm font-semibold text-foreground">
              Newsletter
            </h3>
            <p className="mt-4 text-body-sm text-muted-foreground">
              Get the latest articles delivered to your inbox.
            </p>
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="you@example.com"
                aria-label="Email for newsletter"
                className="flex-1"
              />
              <Button type="submit" size="sm" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-caption">
            &copy; {year} AI Blog Platform. All rights reserved.
          </p>
          <p className="text-caption">
            Fresh, SEO-ready stories updated regularly.
          </p>
        </div>
      </div>
    </footer>
  );
}
