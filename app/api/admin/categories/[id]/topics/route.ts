import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateTopics } from "@/lib/ai";
import { logActivity } from "@/lib/activity";
import { jsonError, requireAdminApi } from "@/lib/api";
import type { Category, Topic } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: topics, error } = await supabase
    .from("topics")
    .select("*")
    .eq("category_id", id)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ topics: (topics ?? []) as Topic[] });
}

const postSchema = z.union([
  z.object({ count: z.number().int().min(1).max(100) }),
  z.object({ topic: z.string().min(1).max(500) }),
]);

export async function POST(request: Request, context: Ctx) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body");
  }

  const supabase = await createClient();
  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (catError) return jsonError(catError.message, 500);
  if (!category) return jsonError("Category not found", 404);

  const cat = category as Category;
  if (cat.status !== "active") {
    return jsonError("Cannot add topics for inactive categories", 400);
  }

  if ("topic" in parsed.data) {
    const { data: topic, error: insertError } = await supabase
      .from("topics")
      .insert({
        category_id: id,
        topic: parsed.data.topic,
        status: "pending",
        created_by: auth.admin.id,
      })
      .select()
      .maybeSingle();

    if (insertError) return jsonError(insertError.message, 500);

    await logActivity(supabase, {
      adminId: auth.admin.id,
      action: "topic.create",
      entityType: "topic",
      entityId: topic?.id ?? null,
    });

    return NextResponse.json({ topic });
  }

  let topicStrings: string[];
  try {
    topicStrings = await generateTopics({
      categoryName: cat.name,
      categoryDescription: cat.description ?? undefined,
      count: parsed.data.count,
    });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Topic generation failed",
      502,
    );
  }

  const rows = topicStrings.map((topic) => ({
    category_id: id,
    topic,
    status: "pending" as const,
    created_by: auth.admin.id,
  }));

  const { data: topics, error: insertError } = await supabase
    .from("topics")
    .insert(rows)
    .select();

  if (insertError) return jsonError(insertError.message, 500);

  await logActivity(supabase, {
    adminId: auth.admin.id,
    action: "topics.generate",
    entityType: "category",
    entityId: id,
    metadata: { count: topicStrings.length },
  });

  return NextResponse.json({ topics: (topics ?? []) as Topic[] });
}
