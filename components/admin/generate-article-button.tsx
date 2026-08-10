"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/fetch-json";

/** Placeholder used by TopicTable; full implementation in Phase 8. */
export function GenerateArticleButton({
  topicId,
  disabled,
}: {
  topicId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const { res, data } = await fetchJson<{ error?: string; article?: { id: string } }>(
        `/api/admin/topics/${topicId}/generate-article`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(data.error || "Could not create article");
      if (!data.article?.id) throw new Error("Could not create article");
      router.push(`/admin/articles/${data.article.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <Button size="sm" onClick={onClick} disabled={disabled || loading}>
        {loading ? "Creating…" : "Create draft"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
