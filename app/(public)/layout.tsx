import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { getSiteSettings } from "@/lib/site-settings";
import type { Category } from "@/lib/types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [{ data: categories }, socialLinks] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("status", "active")
      .order("name"),
    getSiteSettings(),
  ]);

  const cats = (categories ?? []) as Category[];

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Suspense fallback={<header className="sticky top-0 z-50 h-16 border-b border-border/80 bg-background/85" />}>
        <PublicHeader categories={cats} />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        {children}
      </main>
      <PublicFooter categories={cats} socialLinks={socialLinks} />
    </div>
  );
}
