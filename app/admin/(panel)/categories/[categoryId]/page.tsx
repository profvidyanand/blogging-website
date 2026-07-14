import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { TopicTable } from "@/components/admin/topic-table";
import { GetTopicsForm } from "@/components/admin/get-topics-form";
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
      <div>
        <Link
          href="/admin/categories"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Categories
        </Link>
        <PageHeader
          title={cat.name}
          description={cat.description ?? undefined}
          actions={<Badge variant={cat.status === "active" ? "default" : "secondary"}>{cat.status}</Badge>}
        />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Generate topics
        </h2>
        <GetTopicsForm
          categoryId={cat.id}
          disabled={cat.status !== "active"}
        />
        {cat.status !== "active" ? (
          <p className="mt-2 text-sm text-amber-700">
            Inactive categories cannot generate new topics.
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Topics</h2>
        <TopicTable topics={(topics ?? []) as Topic[]} />
      </section>
    </div>
  );
}
