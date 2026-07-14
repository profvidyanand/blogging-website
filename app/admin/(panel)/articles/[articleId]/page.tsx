import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ArticlePreviewActions } from "./preview-actions";
import type { Article, Category } from "@/lib/types";

type Props = { params: Promise<{ articleId: string }> };

export default async function ArticlePreviewPage({ params }: Props) {
  await requireAdmin();
  const { articleId } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .maybeSingle();

  if (!article) notFound();
  const row = article as Article;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", row.category_id)
    .maybeSingle();

  return (
    <ArticlePreviewActions
      article={row}
      category={(category as Category | null) ?? null}
    />
  );
}
