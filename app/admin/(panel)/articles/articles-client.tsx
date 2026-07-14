"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ScheduleDialog } from "@/components/admin/schedule-dialog";
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

  async function postAction(path: string) {
    const res = await fetch(path, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Action failed");
    router.refresh();
  }

  async function deleteArticle() {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/articles/${deleteId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Delete failed");
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
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={applyFilters}
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-3"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-8 rounded-lg border border-input px-2 text-sm"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-8 rounded-lg border border-input px-2 text-sm"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Search</label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title…"
            className="w-48"
          />
        </div>
        <Button type="submit" size="sm">
          Filter
        </Button>
      </form>

      <DataTable
        rows={articles}
        emptyMessage="No articles found."
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (row) => (
              <Link
                href={`/admin/articles/${row.id}`}
                className="font-medium hover:underline"
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
            cell: (row) => <Badge variant="secondary">{row.status}</Badge>,
          },
          {
            key: "actions",
            header: "Actions",
            cell: (row) => (
              <div className="flex flex-wrap gap-1">
                <Link
                  href={`/admin/articles/${row.id}`}
                  className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] hover:bg-muted"
                >
                  Preview
                </Link>
                <Link
                  href={`/admin/articles/${row.id}/edit`}
                  className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] hover:bg-muted"
                >
                  Edit
                </Link>
                {row.status !== "published" ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      postAction(`/api/admin/articles/${row.id}/publish`).catch(
                        alert,
                      )
                    }
                  >
                    Publish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      postAction(
                        `/api/admin/articles/${row.id}/unpublish`,
                      ).catch(alert)
                    }
                  >
                    Unpublish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScheduleId(row.id)}
                >
                  Schedule
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteId(row.id)}
                >
                  Delete
                </Button>
              </div>
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
