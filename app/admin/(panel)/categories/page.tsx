import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { CategoriesClient } from "./categories-client";
import type { Category } from "@/lib/types";

export default async function CategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (categories ?? []) as Category[];

  const withCounts = await Promise.all(
    rows.map(async (cat) => {
      const [{ count: topicCount }, { count: articleCount }] = await Promise.all([
        supabase
          .from("topics")
          .select("*", { count: "exact", head: true })
          .eq("category_id", cat.id),
        supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("category_id", cat.id),
      ]);
      return {
        ...cat,
        topicCount: topicCount ?? 0,
        articleCount: articleCount ?? 0,
      };
    }),
  );

  return (
    <div>
      <CategoriesClient initial={withCounts} />
      {withCounts.length > 0 ? (
        <ul className="sr-only">
          {withCounts.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/categories/${c.id}`}>{c.name}</Link>
              <Badge>{c.status}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
