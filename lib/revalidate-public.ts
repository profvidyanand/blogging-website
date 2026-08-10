import { revalidatePath, revalidateTag } from "next/cache";

type RevalidateOptions = {
  articleSlug?: string;
  previousArticleSlug?: string;
  categorySlug?: string;
  previousCategorySlug?: string;
};

const IMMEDIATE = { expire: 0 } as const;

/** Invalidate cached public pages after admin content changes. */
export function revalidatePublicContent(options: RevalidateOptions = {}) {
  revalidateTag("categories", IMMEDIATE);
  revalidateTag("site-settings", IMMEDIATE);
  revalidateTag("home", IMMEDIATE);
  revalidateTag("articles", IMMEDIATE);
  revalidateTag("sitemap", IMMEDIATE);

  revalidatePath("/");
  revalidatePath("/sitemap");
  revalidatePath("/sitemap.xml");

  const articleSlugs = new Set<string>();
  if (options.articleSlug) articleSlugs.add(options.articleSlug);
  if (options.previousArticleSlug) articleSlugs.add(options.previousArticleSlug);

  for (const slug of articleSlugs) {
    revalidateTag(`article:${slug}`, IMMEDIATE);
    revalidatePath(`/blog/${slug}`);
  }

  const categorySlugs = new Set<string>();
  if (options.categorySlug) categorySlugs.add(options.categorySlug);
  if (options.previousCategorySlug) {
    categorySlugs.add(options.previousCategorySlug);
  }

  for (const slug of categorySlugs) {
    revalidateTag(`category:${slug}`, IMMEDIATE);
    revalidatePath(`/category/${slug}`);
    revalidatePath(`/category/${slug}`, "page");
  }
}
