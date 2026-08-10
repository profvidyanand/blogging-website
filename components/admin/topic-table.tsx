"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, FilePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EditTopicDialog } from "@/components/admin/edit-topic-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { fetchJson } from "@/lib/fetch-json";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/types";

function IconAction({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "cursor-pointer disabled:cursor-not-allowed",
        destructive && "text-destructive hover:text-destructive"
      )}
    >
      {children}
    </Button>
  );

  return (
    <Tooltip>
      {disabled ? (
        <TooltipTrigger render={<span className="inline-flex cursor-not-allowed" />}>
          {button}
        </TooltipTrigger>
      ) : (
        <TooltipTrigger render={button} />
      )}
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function TopicTable({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deleteTopic, setDeleteTopic] = useState<Topic | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

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

  return (
    <TooltipProvider delay={300}>
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
            className: "w-[1%] whitespace-nowrap text-right",
            mobileActions: true,
            cell: (row) => {
              const isGenerating = generatingId === row.id;
              const canGenerate = row.status !== "generated" && !isGenerating;

              return (
                <div className="flex w-full flex-wrap items-center justify-end gap-1.5">
                  <StatusBadge
                    status={row.status === "generated" ? "generating" : row.status}
                  />
                  <IconAction
                    label={
                      isGenerating
                        ? "Creating draft…"
                        : canGenerate
                          ? "Create article draft"
                          : "Article already created"
                    }
                    disabled={!canGenerate}
                    onClick={() => generateArticle(row.id)}
                  >
                    {isGenerating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FilePlus className="size-4" />
                    )}
                  </IconAction>
                  <IconAction
                    label="Edit topic"
                    onClick={() => setEditTopic(row)}
                  >
                    <Pencil className="size-4" />
                  </IconAction>
                  <IconAction
                    label="Delete topic"
                    destructive
                    onClick={() => setDeleteTopic(row)}
                  >
                    <Trash2 className="size-4" />
                  </IconAction>
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
    </TooltipProvider>
  );
}
