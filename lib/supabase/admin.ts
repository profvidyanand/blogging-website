import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Secret-key (service-role) client. Bypasses RLS.
 * Use ONLY for:
 * 1. POST /api/admin/categories (atomic category + assignment)
 * 2. GET /api/admin/dashboard/stats (manually scoped aggregates)
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
