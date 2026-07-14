import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import type { Category } from "@/lib/types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "active")
    .order("name");

  const cats = (categories ?? []) as Category[];

  return (
    <div className="flex min-h-full flex-col bg-background">
      <PublicHeader categories={cats} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        {children}
      </main>
      <PublicFooter categories={cats} />
    </div>
  );
}
