import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ArticleEditor } from "@/components/admin/article-editor";
import type { Article } from "@/lib/types";

type Props = { params: Promise<{ articleId: string }> };

export default async function EditArticlePage({ params }: Props) {
  await requireAdmin();
  const { articleId } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .maybeSingle();

  if (!article) notFound();

  return (
    <div>
      <Link
        href={`/admin/articles/${articleId}`}
        className="inline-flex text-body-sm text-muted-foreground hover:text-foreground"
      >
        ← Preview
      </Link>
      <PageHeader title="Edit article" description="Update content and SEO fields." />
      <ArticleEditor article={article as Article} />
    </div>
  );
}
