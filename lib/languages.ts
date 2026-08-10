import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export type LanguageRow = Database["public"]["Tables"]["languages"]["Row"];

export const DEFAULT_LANGUAGE = "english";

export function formatLanguageLabel(code: string): string {
  return code
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getLanguageLabel(
  code: string | null | undefined,
  labels?: Record<string, string>,
): string {
  if (!code) return formatLanguageLabel(DEFAULT_LANGUAGE);
  return labels?.[code] ?? formatLanguageLabel(code);
}

export async function getLanguages(
  supabase: SupabaseClient<Database>,
): Promise<LanguageRow[]> {
  const { data, error } = await supabase
    .from("languages")
    .select("*")
    .order("label", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLanguageMap(
  supabase: SupabaseClient<Database>,
): Promise<Record<string, string>> {
  const languages = await getLanguages(supabase);
  return Object.fromEntries(languages.map((row) => [row.code, row.label]));
}

export async function languageExists(
  supabase: SupabaseClient<Database>,
  code: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("languages")
    .select("code")
    .eq("code", code)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
}
