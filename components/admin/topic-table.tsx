"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EditTopicDialog } from "@/components/admin/edit-topic-dialog";
import { GenerateArticleButton } from "@/components/admin/generate-article-button";
import type { Topic } from "@/lib/types";

export function TopicTable({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<Topic | null>(null);

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

  return (
    <>
      <DataTable
        rows={topics}
        emptyMessage="No topics yet. Use Get Topics to generate some."
        columns={[
          {
            key: "topic",
            header: "Topic",
            cell: (row) => <span className="max-w-md">{row.topic}</span>,
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => (
              <Badge
                variant={row.status === "generated" ? "secondary" : "default"}
              >
                {row.status}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            cell: (row) => (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditTopic(row)}
                >
                  Edit
                </Button>
                <GenerateArticleButton
                  topicId={row.id}
                  disabled={row.status === "generated"}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteTopic(row)}
                >
                  Delete
                </Button>
              </div>
            ),
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
