import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActivityLog, Article } from "@/lib/types";

export default async function AdminDashboardPage() {
  const adminUser = await requireAdmin();
  const session = await createClient();

  const { data: assignments } = await session
    .from("category_assignments")
    .select("category_id")
    .eq("admin_id", adminUser.id);

  const categoryIds = (assignments ?? []).map(
    (a: { category_id: string }) => a.category_id,
  );

  let totalCategories = 0;
  let totalTopics = 0;
  let totalPublished = 0;
  let totalDraft = 0;
  let recentPublished: Article[] = [];
  let recentActivity: ActivityLog[] = [];

  if (categoryIds.length > 0) {
    const admin = createAdminClient();
    const [c, t, p, d, rp] = await Promise.all([
      admin
        .from("categories")
        .select("*", { count: "exact", head: true })
        .in("id", categoryIds),
      admin
        .from("topics")
        .select("*", { count: "exact", head: true })
        .in("category_id", categoryIds),
      admin
        .from("articles")
        .select("*", { count: "exact", head: true })
        .in("category_id", categoryIds)
        .eq("status", "published"),
      admin
        .from("articles")
        .select("*", { count: "exact", head: true })
        .in("category_id", categoryIds)
        .eq("status", "draft"),
      admin
        .from("articles")
        .select("*")
        .in("category_id", categoryIds)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5),
    ]);
    totalCategories = c.count ?? 0;
    totalTopics = t.count ?? 0;
    totalPublished = p.count ?? 0;
    totalDraft = d.count ?? 0;
    recentPublished = (rp.data ?? []) as Article[];
  }

  const { data: activity } = await session
    .from("activity_log")
    .select("*")
    .eq("admin_id", adminUser.id)
    .order("created_at", { ascending: false })
    .limit(10);
  recentActivity = (activity ?? []) as ActivityLog[];

  const stats = [
    { label: "Categories", value: totalCategories },
    { label: "Topics", value: totalTopics },
    { label: "Published", value: totalPublished },
    { label: "Draft", value: totalDraft },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back${adminUser.fullName ? `, ${adminUser.fullName}` : ""}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-500">No activity yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentActivity.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2">
                    <span>
                      <code className="text-xs">{a.action}</code>{" "}
                      <span className="text-zinc-500">{a.entity_type}</span>
                    </span>
                    <time className="shrink-0 text-xs text-zinc-400">
                      {new Date(a.created_at).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent published blogs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPublished.length === 0 ? (
              <p className="text-sm text-zinc-500">No published articles yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentPublished.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="font-medium hover:underline"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
