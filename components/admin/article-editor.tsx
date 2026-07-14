"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Article, FaqItem } from "@/lib/types";

export function ArticleEditor({ article }: { article: Article }) {
  const router = useRouter();
  const faqInitial = (Array.isArray(article.faq) ? article.faq : []) as FaqItem[];

  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug);
  const [seoTitle, setSeoTitle] = useState(article.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    article.meta_description ?? "",
  );
  const [summary, setSummary] = useState(article.summary ?? "");
  const [content, setContent] = useState(article.content);
  const [featuredImage, setFeaturedImage] = useState(article.featured_image ?? "");
  const [tags, setTags] = useState((article.tags ?? []).join(", "));
  const [faq, setFaq] = useState<FaqItem[]>(
    faqInitial.length ? faqInitial : [{ question: "", answer: "" }],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          seoTitle: seoTitle || null,
          metaDescription: metaDescription || null,
          summary: summary || null,
          content,
          featuredImage: featuredImage || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          faq: faq.filter((f) => f.question.trim() && f.answer.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSave} className="mx-auto max-w-3xl space-y-4">
      <Field label="Title" value={title} onChange={setTitle} required />
      <Field label="Slug" value={slug} onChange={setSlug} required />
      <Field label="SEO title" value={seoTitle} onChange={setSeoTitle} />
      <div className="space-y-2">
        <Label>Meta description</Label>
        <Textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Summary</Label>
        <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Content (HTML)</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="font-mono text-xs"
        />
      </div>
      <Field
        label="Featured image URL"
        value={featuredImage}
        onChange={setFeaturedImage}
      />
      {featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={featuredImage}
          alt=""
          className="max-h-48 rounded-md border object-cover"
        />
      ) : null}
      <Field label="Tags (comma-separated)" value={tags} onChange={setTags} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>FAQ</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setFaq([...faq, { question: "", answer: "" }])}
          >
            Add FAQ
          </Button>
        </div>
        {faq.map((item, i) => (
          <div key={i} className="space-y-2 rounded-md border p-3">
            <Input
              placeholder="Question"
              value={item.question}
              onChange={(e) => {
                const next = [...faq];
                next[i] = { ...next[i], question: e.target.value };
                setFaq(next);
              }}
            />
            <Textarea
              placeholder="Answer"
              value={item.answer}
              onChange={(e) => {
                const next = [...faq];
                next[i] = { ...next[i], answer: e.target.value };
                setFaq(next);
              }}
              rows={2}
            />
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-green-700">Saved.</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/articles/${article.id}`)}
        >
          Preview
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
