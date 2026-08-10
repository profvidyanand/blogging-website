import { notFound } from "next/navigation";
import { getCategoryArticles, getCategoryBySlug } from "@/lib/public-data";
import { CategoryArticlesView } from "@/components/public/category-articles-view";
import { getCategoryAccent } from "@/lib/category-colors";
import {
  CATEGORY_MAX_PAGE,
  CATEGORY_PAGE_SIZE,
} from "@/lib/category-pagination";

export const revalidate = 54000;

type Props = {
  params: Promise<{ slug: string; page: string }>;
};

export default async function CategoryPaginatedPage({ params }: Props) {
  const { slug, page: pageParam } = await params;
  const page = Number(pageParam);

  if (!Number.isInteger(page) || page < 2 || page > CATEGORY_MAX_PAGE) {
    notFound();
  }

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const { posts, totalCount } = await getCategoryArticles(
    cat.id,
    cat.slug,
    page,
    CATEGORY_PAGE_SIZE,
  );

  const totalPages = Math.min(
    CATEGORY_MAX_PAGE,
    Math.max(1, Math.ceil(totalCount / CATEGORY_PAGE_SIZE)),
  );

  if (page > totalPages) notFound();

  return (
    <CategoryArticlesView
      cat={cat}
      posts={posts}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      accent={getCategoryAccent(cat.name)}
    />
  );
}
