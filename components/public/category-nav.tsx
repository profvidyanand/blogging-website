"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const navLinkClass =
  "shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors";

function navLinkClasses(active: boolean) {
  return cn(
    navLinkClass,
    active ? "text-primary" : "text-foreground/80 hover:text-primary"
  );
}

export function CategoryNav({
  categories,
  isHomeActive,
  activeCategorySlug,
}: {
  categories: Category[];
  isHomeActive: boolean;
  activeCategorySlug?: string;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [useDropdown, setUseDropdown] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const updateLayout = () => {
      setUseDropdown(measure.offsetWidth > container.clientWidth);
    };

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    window.addEventListener("resize", updateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [categories]);

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  return (
    <nav
      ref={containerRef}
      className="relative flex min-w-0 flex-1 items-center justify-end gap-1 overflow-hidden"
    >
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 flex items-center gap-1"
      >
        <span className={navLinkClasses(false)}>Home</span>
        {categories.map((c) => (
          <span key={c.id} className={navLinkClasses(false)}>
            {c.name}
          </span>
        ))}
      </div>

      <Link href="/" className={navLinkClasses(isHomeActive)}>
        Home
      </Link>

      {categories.length === 0 ? null : useDropdown ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              navLinkClass,
              "inline-flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              activeCategorySlug
                ? "text-primary"
                : "text-foreground/80 hover:text-primary"
            )}
          >
            {activeCategory?.name ?? "Categories"}
            <ChevronDown className="size-3.5 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44 max-h-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Browse categories</DropdownMenuLabel>
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  render={<Link href={`/category/${c.slug}`} />}
                  className={cn(
                    activeCategorySlug === c.slug &&
                      "font-medium text-primary focus:text-primary"
                  )}
                >
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className={navLinkClasses(activeCategorySlug === c.slug)}
          >
            {c.name}
          </Link>
        ))
      )}
    </nav>
  );
}
