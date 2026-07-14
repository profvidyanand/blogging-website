import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { ArticlesClient } from "./articles-client";
import type { Article, Category } from "@/lib/types";

type SearchParams = Promise<{
  status?: string;
  categoryId?: string;
  q?: string;
}>;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const filters = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (filters.status) {
    query = query.eq(
      "status",
      filters.status as Article["status"],
    );
  }
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.q) query = query.ilike("title", `%${filters.q}%`);

  const [{ data: articles }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("name"),
  ]);

  const cats = (categories ?? []) as Category[];
  const catMap = new Map(cats.map((c) => [c.id, c.name]));

  const rows = ((articles ?? []) as Article[]).map((a) => ({
    ...a,
    categoryName: catMap.get(a.category_id),
  }));

  return (
    <div>
      <PageHeader
        title="Blog Management"
        description="Filter, preview, publish, schedule, and edit articles."
      />
      <ArticlesClient articles={rows} categories={cats} filters={filters} />
    </div>
  );
}
