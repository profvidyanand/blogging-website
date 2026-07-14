import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryAccent } from "@/lib/category-colors";
import type { Category } from "@/lib/types";

/** Colorful tile used in the "Explore categories" band on the home page. */
export function CategoryTile({ category }: { category: Category }) {
  const accent = getCategoryAccent(category.name);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-hover"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          accent.bg,
          accent.text
        )}
      >
        {category.name.charAt(0).toUpperCase()}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1 font-semibold text-foreground">
          {category.name}
          <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 line-clamp-2 text-caption">
          {category.description || `Latest ${category.name.toLowerCase()} stories`}
        </span>
      </span>
    </Link>
  );
}
