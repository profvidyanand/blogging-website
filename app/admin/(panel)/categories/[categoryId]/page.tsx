import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { LanguageBadge } from "@/components/admin/language-badge";
import { TopicTable } from "@/components/admin/topic-table";
import { GetTopicsForm } from "@/components/admin/get-topics-form";
import { AddTopicForm } from "@/components/admin/add-topic-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category, Topic } from "@/lib/types";

type Props = { params: Promise<{ categoryId: string }> };

export default async function CategoryDetailPage({ params }: Props) {
  await requireAdmin();
  const { categoryId } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .maybeSingle();

  if (!category) notFound();
  const cat = category as Category;

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/categories"
        className="inline-flex text-body-sm text-muted-foreground hover:text-foreground"
      >
        ← Categories
      </Link>
      <PageHeader
        title={cat.name}
        description={cat.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <LanguageBadge language={cat.language} />
            <StatusBadge status={cat.status} />
          </div>
        }
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-body-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Suggest topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <GetTopicsForm
            categoryId={cat.id}
            disabled={cat.status !== "active"}
          />
          <AddTopicForm
            categoryId={cat.id}
            disabled={cat.status !== "active"}
          />
          {cat.status !== "active" ? (
            <p className="mt-3 rounded-md bg-warning/15 px-3 py-2 text-body-sm text-warning-foreground">
              Inactive categories cannot add new topics.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-h2">Topics</h2>
        <TopicTable topics={(topics ?? []) as Topic[]} />
      </section>
    </div>
  );
}
