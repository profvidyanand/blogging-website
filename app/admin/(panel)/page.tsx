import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { RecentActivityCard } from "@/components/admin/recent-activity-card";
import { RecentPublishedBlogsCard } from "@/components/admin/recent-published-blogs-card";
import { StatCard } from "@/components/admin/stat-card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActivityLog, Article } from "@/lib/types";
import {
  FolderOpen,
  FileText,
  CheckCircle,
  FilePen,
} from "lucide-react";

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

  const entityLabels = new Map<string, string>();
  if (recentActivity.length > 0) {
    const idsByType = { article: new Set<string>(), category: new Set<string>(), topic: new Set<string>() } as Record<
      "article" | "category" | "topic",
      Set<string>
    >;
    for (const a of recentActivity) {
      if (a.entity_id && a.entity_type in idsByType) {
        idsByType[a.entity_type as "article" | "category" | "topic"].add(a.entity_id);
      }
    }
    const admin = createAdminClient();
    const [articleRows, categoryRows, topicRows] = await Promise.all([
      idsByType.article.size
        ? admin.from("articles").select("id, title").in("id", [...idsByType.article])
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
      idsByType.category.size
        ? admin.from("categories").select("id, name").in("id", [...idsByType.category])
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      idsByType.topic.size
        ? admin.from("topics").select("id, topic").in("id", [...idsByType.topic])
        : Promise.resolve({ data: [] as { id: string; topic: string }[] }),
    ]);
    for (const row of articleRows.data ?? []) entityLabels.set(row.id, row.title);
    for (const row of categoryRows.data ?? []) entityLabels.set(row.id, row.name);
    for (const row of topicRows.data ?? []) {
      entityLabels.set(row.id, row.topic.length > 60 ? `${row.topic.slice(0, 60)}…` : row.topic);
    }
  }

  const stats = [
    { label: "Categories", value: totalCategories, icon: FolderOpen },
    { label: "Topics", value: totalTopics, icon: FileText },
    { label: "Published", value: totalPublished, icon: CheckCircle },
    { label: "Draft", value: totalDraft, icon: FilePen },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back${adminUser.fullName ? `, ${adminUser.fullName}` : ""}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={s.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityCard
          activities={recentActivity}
          entityLabels={Object.fromEntries(entityLabels)}
        />

        <RecentPublishedBlogsCard articles={recentPublished} />
      </div>
    </div>
  );
}
