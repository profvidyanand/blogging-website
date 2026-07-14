import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Admin } from "@/lib/types";

export type AuthAdmin = {
  id: string;
  email: string;
  fullName: string | null;
};

export async function requireAdmin(): Promise<AuthAdmin> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

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
