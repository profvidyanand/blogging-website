"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ScheduleDialog } from "@/components/admin/schedule-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { LoadingLabel } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";
import type { Article, Category } from "@/lib/types";

type Row = Article & { categoryName?: string };

export function ArticlesClient({
  articles,
  categories,
  filters,
}: {
  articles: Row[];
  categories: Category[];
  filters: { status?: string; categoryId?: string; q?: string };
}) {
  const router = useRouter();
  const [isFiltering, startFilterTransition] = useTransition();
  const [status, setStatus] = useState(filters.status ?? "");
  const [categoryId, setCategoryId] = useState(filters.categoryId ?? "");
  const [q, setQ] = useState(filters.q ?? "");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"publish" | "unpublish" | null>(
    null,
  );

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    if (q.trim()) params.set("q", q.trim());
    startFilterTransition(() => {
      router.push(`/admin/articles?${params.toString()}`);
    });
  }

  async function postAction(
    articleId: string,
    type: "publish" | "unpublish",
    path: string,
    successMsg: string,
  ) {
    setActionId(articleId);
    setActionType(type);
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      toast.success(successMsg);
      router.refresh();
    } finally {
      setActionId(null);
      setActionType(null);
    }
  }

  async function deleteArticle() {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/articles/${deleteId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Delete failed");
    toast.success("Article deleted");
    router.refresh();
  }

  async function scheduleArticle(iso: string) {
    if (!scheduleId) return;
    const res = await fetch(`/api/admin/articles/${scheduleId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: iso }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Schedule failed");
    toast.success("Article scheduled");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <form
            onSubmit={applyFilters}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end"
          >
            <div className="space-y-1.5">
              <Label htmlFor="filter-status" className="text-caption">
                Status
              </Label>
              <select
                id="filter-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isFiltering}
                className="flex h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-category" className="text-caption">
                Category
              </Label>
              <select
                id="filter-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isFiltering}
                className="flex h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-q" className="text-caption">
                Search
              </Label>
              <Input
                id="filter-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Title…"
                className="w-full"
                disabled={isFiltering}
              />
            </div>
            <Button
              type="submit"
              className="min-h-10 w-full sm:w-auto lg:shrink-0"
              disabled={isFiltering}
            >
              <LoadingLabel
                loading={isFiltering}
                label="Filter"
                loadingLabel="Filtering…"
              />
            </Button>
          </form>
        </CardContent>
      </Card>

      <DataTable
        rows={articles}
        emptyTitle="No articles found"
        emptyMessage="Try adjusting your filters."
        columns={[
          {
            key: "title",
            header: "Title",
            mobileTitle: true,
            cell: (row) => (
              <Link
                href={`/admin/articles/${row.id}`}
                className="font-medium text-primary hover:underline"
              >
                {row.title}
              </Link>
            ),
          },
          {
            key: "category",
            header: "Category",
            cell: (row) => row.categoryName ?? "—",
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: "actions",
            header: "",
            className: "w-12",
            mobileActions: true,
            cell: (row) => {
              const isRowBusy = actionId === row.id;
              return (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isRowBusy}
                    />
                  }
                >
                  {isRowBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="size-4" />
                  )}
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    render={<Link href={`/admin/articles/${row.id}`} />}
                    disabled={isRowBusy}
                  >
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href={`/admin/articles/${row.id}/edit`} />}
                    disabled={isRowBusy}
                  >
                    Edit
                  </DropdownMenuItem>
                  {row.status !== "published" ? (
                    <DropdownMenuItem
                      disabled={isRowBusy}
                      onClick={() =>
                        postAction(
                          row.id,
                          "publish",
                          `/api/admin/articles/${row.id}/publish`,
                          "Article published",
                        ).catch((e) =>
                          toast.error(e instanceof Error ? e.message : "Failed")
                        )
                      }
                    >
                      {isRowBusy && actionType === "publish"
                        ? "Publishing…"
                        : "Publish"}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      disabled={isRowBusy}
                      onClick={() =>
                        postAction(
                          row.id,
                          "unpublish",
                          `/api/admin/articles/${row.id}/unpublish`,
                          "Article unpublished",
                        ).catch((e) =>
                          toast.error(e instanceof Error ? e.message : "Failed")
                        )
                      }
                    >
                      {isRowBusy && actionType === "unpublish"
                        ? "Unpublishing…"
                        : "Unpublish"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    disabled={isRowBusy}
                    onClick={() => setScheduleId(row.id)}
                  >
                    Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isRowBusy}
                    onClick={() => setDeleteId(row.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
            },
          },
        ]}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete article?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={deleteArticle}
      />

      <ScheduleDialog
        open={!!scheduleId}
        onOpenChange={(o) => !o && setScheduleId(null)}
        onSchedule={scheduleArticle}
      />
    </div>
  );
}
