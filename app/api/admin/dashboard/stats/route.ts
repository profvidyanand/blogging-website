import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { jsonError, requireAdminApi } from "@/lib/api";
import type { ActivityLog, Article } from "@/lib/types";

export async function GET() {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const session = await createClient();
  const { data: assignments } = await session
    .from("category_assignments")
    .select("category_id")
    .eq("admin_id", auth.admin.id);

  const categoryIds = (assignments ?? []).map(
    (a: { category_id: string }) => a.category_id,
  );

  if (categoryIds.length === 0) {
    return NextResponse.json({
      totalCategories: 0,
      totalTopics: 0,
      totalPublished: 0,
      totalDraft: 0,
      recentActivity: [],
      recentPublished: [],
    });
  }

  // Secret key for aggregates, but always manually scoped to assigned categories
  const admin = createAdminClient();

  const [
    categoriesRes,
    topicsRes,
    publishedRes,
    draftRes,
    recentPublishedRes,
  ] = await Promise.all([
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

  const { data: recentActivity } = await session
    .from("activity_log")
    .select("*")
    .eq("admin_id", auth.admin.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (
    categoriesRes.error ||
    topicsRes.error ||
    publishedRes.error ||
    draftRes.error
  ) {
    return jsonError("Failed to load stats", 500);
  }

  return NextResponse.json({
    totalCategories: categoriesRes.count ?? 0,
    totalTopics: topicsRes.count ?? 0,
    totalPublished: publishedRes.count ?? 0,
    totalDraft: draftRes.count ?? 0,
    recentActivity: (recentActivity ?? []) as ActivityLog[],
    recentPublished: (recentPublishedRes.data ?? []) as Article[],
  });
}
