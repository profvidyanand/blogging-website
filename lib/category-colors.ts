/** Stable, cycling accent palette used for category chips/tiles on the public site. */
const CATEGORY_PALETTE = [
  { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-200" },
  { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
  { bg: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-200" },
  { bg: "bg-cyan-100", text: "text-cyan-700", ring: "ring-cyan-200" },
  { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", ring: "ring-indigo-200" },
] as const;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Deterministic accent for a category, keyed by id/slug so it stays stable across renders. */
export function getCategoryAccent(key: string) {
  return CATEGORY_PALETTE[hashString(key) % CATEGORY_PALETTE.length];
}
