"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;

    void (async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.rpc("increment_article_view_count", {
          article_slug: slug,
        });
        if (!error) sessionStorage.setItem(key, "1");
      } catch {
        // Ignore view tracking failures on the client.
      }
    })();
  }, [slug]);

  return null;
}
