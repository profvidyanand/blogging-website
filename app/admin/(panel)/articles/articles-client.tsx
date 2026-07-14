"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
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
  const [status, setStatus] = useState(filters.status ?? "");
  const [categoryId, setCategoryId] = useState(filters.categoryId ?? "");
  const [q, setQ] = useState(filters.q ?? "");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    if (q.trim()) params.set("q", q.trim());
    router.push(`/admin/articles?${params.toString()}`);
  }

  async function postAction(path: string, successMsg: string) {
    const res = await fetch(path, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Action failed");
    toast.success(successMsg);
    router.refresh();
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
            className="flex flex-wrap items-end gap-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="filter-status" className="text-caption">
                Status
              </Label>
              <select
                id="filter-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 min-w-[140px] rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                className="flex h-10 min-w-[160px] rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                className="w-48"
              />
            </div>
            <Button type="submit" className="min-h-10">
              Filter
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
            cell: (row) => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" />
                  }
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    render={<Link href={`/admin/articles/${row.id}`} />}
                  >
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href={`/admin/articles/${row.id}/edit`} />}
                  >
                    Edit
                  </DropdownMenuItem>
                  {row.status !== "published" ? (
                    <DropdownMenuItem
                      onClick={() =>
                        postAction(
                          `/api/admin/articles/${row.id}/publish`,
                          "Article published"
                        ).catch((e) =>
                          toast.error(e instanceof Error ? e.message : "Failed")
                        )
                      }
                    >
                      Publish
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() =>
                        postAction(
                          `/api/admin/articles/${row.id}/unpublish`,
                          "Article unpublished"
                        ).catch((e) =>
                          toast.error(e instanceof Error ? e.message : "Failed")
                        )
                      }
                    >
                      Unpublish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setScheduleId(row.id)}>
                    Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteId(row.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
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
