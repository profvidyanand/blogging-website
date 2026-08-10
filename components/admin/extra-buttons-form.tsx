"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingLabel } from "@/components/ui/spinner";
import { toast } from "@/lib/toast";
import type { ExtraButton } from "@/lib/site-config";

export function ExtraButtonsForm({ initial }: { initial: ExtraButton[] }) {
  const [buttons, setButtons] = useState<ExtraButton[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateButton(index: number, field: keyof ExtraButton, value: string) {
    setButtons((prev) =>
      prev.map((button, i) =>
        i === index ? { ...button, [field]: value } : button,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/extra-buttons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buttons }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setButtons(data.buttons);
      toast.success("Extra buttons saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>About page buttons</CardTitle>
        <p className="text-body-sm text-muted-foreground">
          Configure up to five buttons shown at the bottom of the About page.
          Leave both fields empty to hide a button.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {buttons.map((button, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <p className="text-sm font-medium text-foreground">
                Button {index + 1}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`extra-button-name-${index}`}>Label</Label>
                  <Input
                    id={`extra-button-name-${index}`}
                    value={button.name}
                    onChange={(e) => updateButton(index, "name", e.target.value)}
                    placeholder="e.g. Google Scholar"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`extra-button-url-${index}`}>Link URL</Label>
                  <Input
                    id={`extra-button-url-${index}`}
                    type="url"
                    value={button.url}
                    onChange={(e) => updateButton(index, "url", e.target.value)}
                    placeholder="https://example.com/your-link"
                  />
                </div>
              </div>
            </div>
          ))}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            <LoadingLabel
              loading={loading}
              label="Save buttons"
              loadingLabel="Saving…"
            />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
