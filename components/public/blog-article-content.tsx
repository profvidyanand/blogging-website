import { renderBlogContent } from "@/lib/render-blog-content";
import { cn } from "@/lib/utils";

export function BlogArticleContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const processed = renderBlogContent(html);

  return (
    <div
      data-tts-root
      className={cn("blog-content", className)}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
