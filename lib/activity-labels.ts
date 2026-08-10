const ENTITY_NOUNS: Record<string, string> = {
  article: "article",
  topic: "topic",
  category: "category",
};

function quoted(label?: string | null) {
  return label ? `"${label}"` : null;
}

/**
 * Turns a raw activity_log row (e.g. action="article.publish") into a
 * plain-English sentence a non-technical admin can understand at a glance.
 * `entityLabel` is the human name/title of the affected row, when known.
 */
export function formatActivityMessage(
  log: { action: string; entity_type: string; metadata: unknown },
  entityLabel?: string | null
): string {
  const meta =
    typeof log.metadata === "object" && log.metadata !== null
      ? (log.metadata as Record<string, unknown>)
      : {};
  const noun = ENTITY_NOUNS[log.entity_type] ?? log.entity_type;
  const label = quoted(entityLabel) ?? `a ${noun}`;

  switch (log.action) {
    case "article.generate":
      return `Generated new article ${label}`;
    case "article.update":
      return `Edited article ${label}`;
    case "article.delete":
      return `Deleted article ${label}`;
    case "article.publish":
      return `Published article ${label}`;
    case "article.unpublish":
      return `Unpublished article ${label}`;
    case "topic.update":
      return `Edited topic ${label}`;
    case "topic.create":
      return `Added topic ${label}`;
    case "topic.delete":
      return `Deleted topic ${label}`;
    case "topics.generate": {
      const count = typeof meta.count === "number" ? meta.count : null;
      const categoryLabel = quoted(entityLabel) ?? "a category";
      return count
        ? `Generated ${count} new topic${count === 1 ? "" : "s"} for ${categoryLabel}`
        : `Generated new topics for ${categoryLabel}`;
    }
    case "category.create":
      return `Created category ${label}`;
    case "category.update":
      return `Edited category ${label}`;
    case "category.delete":
      return `Deleted category ${label}`;
    default:
      return `${log.action.replace(".", " ")} — ${noun}`;
  }
}
