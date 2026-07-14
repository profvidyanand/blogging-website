"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  CategoryForm,
  type CategoryFormValues,
} from "@/components/admin/category-form";
import type { Category } from "@/lib/types";

type Row = Category & { topicCount: number; articleCount: number };

export function CategoriesClient({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);

  async function createCategory(values: CategoryFormValues) {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create");
    setCreateOpen(false);
    router.refresh();
  }

  async function updateCategory(values: CategoryFormValues) {
    if (!editRow) return;
    const res = await fetch(`/api/admin/categories/${editRow.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    setEditRow(null);
    router.refresh();
  }

  async function deleteCategory() {
    if (!deleteRow) return;
    const res = await fetch(`/api/admin/categories/${deleteRow.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete");
    setDeleteRow(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>New Category</Button>
      </div>

      <DataTable
        rows={initial}
        emptyMessage="No categories yet. Create one to get started."
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (row) => (
              <Link
                href={`/admin/categories/${row.id}`}
                className="font-medium hover:underline"
              >
                {row.name}
              </Link>
            ),
          },
          {
            key: "slug",
            header: "Slug",
            cell: (row) => (
              <code className="text-xs text-zinc-500">{row.slug}</code>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <Badge variant={row.status === "active" ? "default" : "secondary"}>
                {row.status}
              </Badge>
            ),
          },
          {
            key: "topics",
            header: "Topics",
            cell: (row) => row.topicCount,
          },
          {
            key: "articles",
            header: "Articles",
            cell: (row) => row.articleCount,
          },
          {
            key: "actions",
            header: "Actions",
            cell: (row) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditRow(row)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteRow(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            submitLabel="Create"
            onCancel={() => setCreateOpen(false)}
            onSubmit={createCategory}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          {editRow ? (
            <CategoryForm
              initial={editRow}
              submitLabel="Save"
              onCancel={() => setEditRow(null)}
              onSubmit={updateCategory}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteRow}
        onOpenChange={(o) => !o && setDeleteRow(null)}
        title="Delete category?"
        description="This will delete the category and cascade-related topics/articles."
        confirmLabel="Delete"
        destructive
        onConfirm={deleteCategory}
      />
    </div>
  );
}
