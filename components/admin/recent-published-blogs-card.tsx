"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/types";

export function RecentPublishedBlogsCard({
  articles,
}: {
  articles: Article[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="shadow-card">
      <CardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="col-span-2 grid w-full grid-cols-[1fr_auto] items-center gap-2 text-left"
        >
          <CardTitle>Recent published blogs</CardTitle>
          <CardAction>
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </CardAction>
        </button>
      </CardHeader>
      {open ? (
        <CardContent>
          {articles.length === 0 ? (
            <EmptyState
              title="No published articles"
              description="Publish an article to see it here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {articles.map((article) => (
                <li key={article.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}
