import type { FaqItem } from "@/lib/types";

export function BlogArticleFaq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="blog-faq space-y-4 border-t border-border pt-8">
      <h2 className="blog-article-header text-h2 text-foreground">
        Frequently asked questions
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-xl border border-border bg-muted/30 open:bg-card open:shadow-card transition-shadow"
          >
            <summary className="cursor-pointer list-none px-5 py-4 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-3">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                >
                  ▾
                </span>
              </span>
            </summary>
            <div className="border-t border-border px-5 pb-4 pt-3">
              <p className="blog-content !max-w-none !text-base !leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
