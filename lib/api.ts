import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AuthAdmin } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAdminApi(): Promise<
  { admin: AuthAdmin } | { response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { response: jsonError("Unauthorized", 401) };
  }

  return {
    admin: {
      id: user.id,
      email: user.email ?? "",
      fullName:
        (user.user_metadata?.full_name as string | undefined) ?? null,
    },
  };
}
