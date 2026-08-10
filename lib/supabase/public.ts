import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Anonymous read-only Supabase client (no cookies).
 * Use for public pages so Next.js can cache/ISR without forcing dynamic SSR.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
