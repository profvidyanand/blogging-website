"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EditTopicDialog } from "@/components/admin/edit-topic-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { fetchJson } from "@/lib/fetch-json";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/types";

export function TopicTable({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<Topic | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [writingManuallyId, setWritingManuallyId] = useState<string | null>(null);

  async function saveTopic(text: string) {
    if (!editTopic) return;
    const res = await fetch(`/api/admin/topics/${editTopic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    router.refresh();
  }

  async function removeTopic() {
    if (!deleteTopic) return;
    const res = await fetch(`/api/admin/topics/${deleteTopic.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete");
    router.refresh();
  }

  async function generateArticle(topicId: string) {
    setGeneratingId(topicId);
    try {
      const { res, data } = await fetchJson<{ error?: string; article?: { id: string } }>(
        `/api/admin/topics/${topicId}/generate-article`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(data.error || "Could not create article");
      if (!data.article?.id) throw new Error("Could not create article");
      toast.success("Article draft created");
      router.push(`/admin/articles/${data.article.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setGeneratingId(null);
    }
  }

  async function writeManually(topicId: string) {
    setWritingManuallyId(topicId);
    try {
      const { res, data } = await fetchJson<{ error?: string; article?: { id: string } }>(
        `/api/admin/topics/${topicId}/create-manual-article`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(data.error || "Could not create article");
      if (!data.article?.id) throw new Error("Could not create article");
      toast.success("Ready to write — opening editor");
      router.push(`/admin/articles/${data.article.id}/edit`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setWritingManuallyId(null);
    }
  }

  return (
    <>
      <DataTable
        rows={topics}
        emptyTitle="No topics yet"
        emptyMessage="Suggest topics or add one manually."
        columns={[
          {
            key: "topic",
            header: "Topic",
            mobileTitle: true,
            cell: (row) => (
              <span className="block whitespace-normal text-sm font-medium leading-snug">
                {row.topic}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-[1%] text-right",
            mobileActions: true,
            cell: (row) => {
              const isGenerating = generatingId === row.id;
              const isWritingManually = writingManuallyId === row.id;
              const isBusy = isGenerating || isWritingManually;
              const canCreate = row.status !== "generated" && !isBusy;

              return (
                <div className="flex w-full flex-wrap items-center justify-end gap-2">
                  <StatusBadge status={row.status} />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!canCreate}
                    onClick={() => generateArticle(row.id)}
                    className="cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Creating draft…
                      </>
                    ) : (
                      "Create article draft"
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!canCreate}
                    onClick={() => writeManually(row.id)}
                    className="cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isWritingManually ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Opening editor…
                      </>
                    ) : (
                      "Write manually"
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditTopic(row)}
                    className="cursor-pointer"
                  >
                    Edit topic
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteTopic(row)}
                    className={cn(
                      "cursor-pointer text-destructive hover:text-destructive",
                    )}
                  >
                    Delete topic
                  </Button>
                </div>
              );
            },
          },
        ]}
      />

      {editTopic ? (
        <EditTopicDialog
          open={!!editTopic}
          initialTopic={editTopic.topic}
          onOpenChange={(o) => !o && setEditTopic(null)}
          onSave={saveTopic}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTopic}
        onOpenChange={(o) => !o && setDeleteTopic(null)}
        title="Delete topic?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={removeTopic}
      />
    </>
  );
}
