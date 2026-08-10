"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingLabel } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_LANGUAGE, type LanguageRow } from "@/lib/languages";
import type { Category, Language } from "@/lib/types";

export type CategoryFormValues = {
  name: string;
  description: string;
  language: Language;
  status: "active" | "inactive";
};

export function CategoryForm({
  initial,
  languages: initialLanguages,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Category>;
  languages?: LanguageRow[];
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [language, setLanguage] = useState<Language>(
    initial?.language ?? DEFAULT_LANGUAGE,
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    initial?.status ?? "active",
  );
  const [languages, setLanguages] = useState<LanguageRow[]>(initialLanguages ?? []);
  const [languagesLoading, setLanguagesLoading] = useState(!initialLanguages);
  const [addOpen, setAddOpen] = useState(false);
  const [newLanguageLabel, setNewLanguageLabel] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialLanguages) return;

    let cancelled = false;
    async function loadLanguages() {
      setLanguagesLoading(true);
      try {
        const res = await fetch("/api/admin/languages");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load languages");
        if (!cancelled) setLanguages(data.languages ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load languages");
        }
      } finally {
        if (!cancelled) setLanguagesLoading(false);
      }
    }

    void loadLanguages();
    return () => {
      cancelled = true;
    };
  }, [initialLanguages]);

  async function handleAddLanguage(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLanguageLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add language");
      const created = data.language as LanguageRow;
      setLanguages((prev) =>
        [...prev, created].sort((a, b) => a.label.localeCompare(b.label)),
      );
      setLanguage(created.code);
      setNewLanguageLabel("");
      setAddOpen(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add language");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ name, description, language, status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. food, travel, finance"
            required
          />
          <p className="text-caption text-muted-foreground">
            Category name should be in English.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cat-desc">Description</Label>
          <Textarea
            id="cat-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional editorial brief for this category (e.g. tone, depth, special topics)."
          />
          <p className="text-caption text-muted-foreground">
            Used as guidance when creating topics and articles for this category.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="cat-language">Language</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => setAddOpen(true)}
              disabled={languagesLoading}
            >
              <Plus className="mr-1 size-3.5" />
              Add language
            </Button>
          </div>
          <Select
            value={language}
            onValueChange={(value) => value && setLanguage(value)}
            disabled={languagesLoading || languages.length === 0}
          >
            <SelectTrigger id="cat-language" className="w-full">
              <SelectValue
                placeholder={languagesLoading ? "Loading languages…" : "Select language"}
              />
            </SelectTrigger>
            <SelectContent>
              {languages.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-caption text-muted-foreground">
            Topics and articles created for this category will use this language.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cat-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as "active" | "inactive")
            }
          >
            <SelectTrigger id="cat-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={loading || languagesLoading}>
            <LoadingLabel
              loading={loading}
              label={submitLabel}
              loadingLabel="Saving…"
            />
          </Button>
        </div>
      </form>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add language</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLanguage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-language-label">Language name</Label>
              <Input
                id="new-language-label"
                value={newLanguageLabel}
                onChange={(e) => setNewLanguageLabel(e.target.value)}
                placeholder="e.g. Tamil, Bengali, Kannada"
                required
              />
              <p className="text-caption text-muted-foreground">
                A code is generated automatically. Articles and topics for this
                category will be written in this language.
              </p>
            </div>
            {addError ? <p className="text-sm text-destructive">{addError}</p> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                disabled={addLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addLoading}>
                <LoadingLabel
                  loading={addLoading}
                  label="Add language"
                  loadingLabel="Adding…"
                />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
