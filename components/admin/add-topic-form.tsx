"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

export function AddTopicForm({
  categoryId,
  disabled,
}: {
  categoryId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add topic");
      setTopic("");
      toast.success("Topic added");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor="manual-topic">Add topic manually</Label>
        <Input
          id="manual-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic title…"
          disabled={disabled || loading}
          required
        />
      </div>
      <Button type="submit" variant="outline" disabled={disabled || loading || !topic.trim()}>
        {loading ? "Adding…" : "Add topic"}
      </Button>
    </form>
  );
}
