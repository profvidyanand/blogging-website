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

export async function searchImage(query: string): Promise<UnsplashImage | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.warn("UNSPLASH_ACCESS_KEY missing — skipping image search");
    return null;
  }

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "landscape");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` },
  });

  if (!res.ok) {
    console.error("Unsplash search failed:", res.status);
    return null;
  }

  const data = (await res.json()) as UnsplashSearchResponse;
  const photo = data.results?.[0];
  if (!photo) return null;

  const photographer = photo.user.name;
  const profile = photo.user.links?.html;
  const credit = profile
    ? `Photo by ${photographer} on Unsplash`
    : `Photo by ${photographer} on Unsplash`;

  return {
    id: photo.id,
    url: photo.urls.regular,
    downloadLocation: photo.links.download_location,
    credit,
  };
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
