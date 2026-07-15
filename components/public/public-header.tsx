"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Menu, Search, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function PublicHeader({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [isSearching, startSearchTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const isHomeActive = pathname === "/";
  const activeCategorySlug = pathname?.startsWith("/category/")
    ? pathname.split("/")[2]
    : undefined;

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    startSearchTransition(() => {
      router.push(`/search?${params.toString()}`);
      setOpen(false);
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 lg:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-foreground">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-card">
            <Sparkles className="size-4" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            AI Blog Platform
          </span>
        </Link>

        <div className="ml-auto hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex lg:gap-5">
          <form
            onSubmit={onSearchSubmit}
            className="hidden w-40 shrink-0 lg:block lg:w-56"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search"
                className="h-9 rounded-full pl-8"
                disabled={isSearching}
              />
              {isSearching ? (
                <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : null}
            </div>
          </form>
          <Link
            href="/search"
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Search"
          >
            <Search className="size-4" />
          </Link>

          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
            <Link
              href="/"
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                isHomeActive
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
              )}
            >
              Home
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategorySlug === c.slug
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                )}
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <Link
            href="/admin"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0 font-medium")}
          >
            Admin
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto md:hidden"
              />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-72 flex-col">
            <SheetTitle>Menu</SheetTitle>
            <form onSubmit={onSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search"
                className="h-9 rounded-full pl-8"
                disabled={isSearching}
              />
              {isSearching ? (
                <Loader2 className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : null}
            </form>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-[44px] items-center rounded-md px-3 py-3 text-body-sm font-medium",
                  isHomeActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Home
              </Link>

              {categories.length > 0 ? (
                <>
                  <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categories
                  </p>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-[44px] items-center rounded-md px-3 py-3 text-body-sm font-medium",
                        activeCategorySlug === c.slug
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {c.name}
                    </Link>
                  ))}
                </>
              ) : null}
            </nav>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants(), "mt-4 min-h-[44px] w-full")}
            >
              Admin
            </Link>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
