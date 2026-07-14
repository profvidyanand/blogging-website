import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

type EnvLike = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
};

/**
 * Flip due scheduled articles to published.
 * Uses sb_secret — no admin JWT in cron context.
 */
export async function publishDueScheduledArticles(env?: EnvLike) {
  const url = env?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env?.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    console.error("publishDueScheduledArticles: missing Supabase credentials");
    return { updated: 0 };
  }

  const supabase = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const now = new Date().toISOString();

  const { data: due, error: selectError } = await supabase
    .from("articles")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", now);

  if (selectError) {
    console.error("publishDueScheduledArticles select:", selectError.message);
    return { updated: 0 };
  }

  if (!due?.length) return { updated: 0 };

  const ids = due.map((r) => r.id);
  const { error: updateError, count } = await supabase
    .from("articles")
    .update({
      status: "published",
      published_at: now,
      scheduled_at: null,
    })
    .in("id", ids);

  if (updateError) {
    console.error("publishDueScheduledArticles update:", updateError.message);
    return { updated: 0 };
  }

  return { updated: count ?? ids.length };
}
