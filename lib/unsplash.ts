export type UnsplashImage = {
  id: string;
  url: string;
  downloadLocation: string;
  credit: string;
};

type UnsplashSearchResponse = {
  results?: {
    id: string;
    urls: { regular: string };
    links: { download_location: string };
    user: { name: string; links?: { html?: string } };
  }[];
};

type SearchImageOptions = {
  excludeIds?: string[];
};

export async function searchImage(
  query: string,
  options?: SearchImageOptions,
): Promise<UnsplashImage | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.warn("UNSPLASH_ACCESS_KEY missing — skipping image search");
    return null;
  }

  const trimmed = query.trim();
  if (!trimmed) return null;

  const excludeIds = new Set(options?.excludeIds ?? []);

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", trimmed);
  url.searchParams.set("per_page", excludeIds.size > 0 ? "10" : "1");
  url.searchParams.set("orientation", "landscape");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` },
  });

  if (!res.ok) {
    console.error("Unsplash search failed:", res.status, `query="${trimmed}"`);
    return null;
  }

  const data = (await res.json()) as UnsplashSearchResponse;
  const photo = data.results?.find((result) => !excludeIds.has(result.id));
  if (!photo) return null;

  const photographer = photo.user.name;
  const credit = `Photo by ${photographer} on Unsplash`;

  return {
    id: photo.id,
    url: photo.urls.regular,
    downloadLocation: photo.links.download_location,
    credit,
  };
}

/**
 * Try Unsplash search queries in order. Stops at the first photo found.
 * Each null/error counts as a failure and advances to the next query.
 */
export async function searchImageWithFallbacks(
  queries: string[],
  options?: SearchImageOptions,
): Promise<UnsplashImage | null> {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.warn("UNSPLASH_ACCESS_KEY missing — skipping image search");
    return null;
  }

  const candidates = queries
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (candidates.length === 0) {
    console.warn("Unsplash: no image queries provided — skipping image search");
    return null;
  }

  for (let i = 0; i < candidates.length; i++) {
    const query = candidates[i]!;
    try {
      const photo = await searchImage(query, options);
      if (photo) {
        if (i > 0) {
          console.info(
            `Unsplash: matched on fallback query #${i + 1}: "${query}"`,
          );
        }
        return photo;
      }
      console.warn(
        `Unsplash: no results for query #${i + 1}/${candidates.length}: "${query}"`,
      );
    } catch (err) {
      console.error(
        `Unsplash: search failed for query #${i + 1}/${candidates.length}: "${query}"`,
        err,
      );
    }
  }

  console.warn("Unsplash: all image query fallbacks exhausted — continuing without image");
  return null;
}

export async function trackDownload(photo: UnsplashImage): Promise<void> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || !photo.downloadLocation) return;

  try {
    await fetch(photo.downloadLocation, {
      headers: { Authorization: `Client-ID ${key}` },
    });
  } catch (err) {
    console.error("Unsplash download tracking failed:", err);
  }
}
