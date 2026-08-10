"use client";

import { useEffect } from "react";

export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;

    fetch(`/api/articles/${encodeURIComponent(slug)}/view`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(key, "1");
      })
      .catch(() => {});
  }, [slug]);

  return null;
}
