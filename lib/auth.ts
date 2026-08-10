import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Admin } from "@/lib/types";

export type AuthAdmin = {
  id: string;
  email: string;
  fullName: string | null;
};

/** Ensures auth.users id has a matching public.admins row (needed for FK constraints). */
export async function ensureAdminRecord(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const { error } = await admin.from("admins").insert({
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }
}

export async function requireAdmin(): Promise<AuthAdmin> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  await ensureAdminRecord(user);

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const row = admin as Pick<Admin, "id" | "email" | "full_name"> | null;

  return {
    id: user.id,
    email: row?.email ?? user.email ?? "",
    fullName: row?.full_name ?? null,
  };
}

export async function getOptionalAdmin(): Promise<AuthAdmin | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
  };
}
