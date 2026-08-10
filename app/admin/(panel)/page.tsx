import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatActivityMessage } from "@/lib/activity-labels";
import type { ActivityLog, Article } from "@/lib/types";
import {
  FolderOpen,
  FileText,
  CheckCircle,
  FilePen,
  Sparkles,
  Pencil,
  Trash2,
  EyeOff,
  CheckCircle2,
  FolderPlus,
  type LucideIcon,
} from "lucide-react";

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  "article.generate": Sparkles,
  "article.update": Pencil,
  "article.delete": Trash2,
  "article.publish": CheckCircle2,
  "article.unpublish": EyeOff,
  "topic.update": Pencil,
  "topic.delete": Trash2,
  "topics.generate": Sparkles,
  "category.create": FolderPlus,
  "category.update": Pencil,
  "category.delete": Trash2,
};

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
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Actions you take will appear here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {recentActivity.map((a) => {
                  const Icon = ACTIVITY_ICONS[a.action] ?? Pencil;
                  const label = a.entity_id ? entityLabels.get(a.entity_id) : undefined;
                  return (
                    <li
                      key={a.id}
                      className="flex items-start justify-between gap-3 py-2.5 text-body-sm first:pt-0 last:pb-0"
                    >
                      <span className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="text-foreground">
                          {formatActivityMessage(a, label)}
                        </span>
                      </span>
                      <time className="shrink-0 text-caption">
                        {new Date(a.created_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent published blogs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPublished.length === 0 ? (
              <EmptyState
                title="No published articles"
                description="Publish an article to see it here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {recentPublished.map((a) => (
                  <li key={a.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="font-medium text-primary hover:underline"
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
