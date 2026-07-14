import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/types";

type DbClient = SupabaseClient<Database>;

export async function logActivity(
  supabase: DbClient,
  input: {
    adminId: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const { error } = await supabase.from("activity_log").insert({
    admin_id: input.adminId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: (input.metadata ?? {}) as Json,
  });

  if (error) {
    console.error("logActivity failed:", error.message);
  }
}
