export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

/**
 * Try base, then base-2 … base-5. `exists` returns true if the slug is taken.
 */
export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  maxAttempts = 5,
): Promise<string> {
  const root = slugify(base);

  for (let i = 0; i < maxAttempts; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const taken = await exists(candidate);
    if (!taken) return candidate;
  }

  return `${root}-${Date.now().toString(36)}`;
}
