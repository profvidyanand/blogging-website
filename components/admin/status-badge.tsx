import { cn } from "@/lib/utils";

type Status =
  | "published"
  | "draft"
  | "active"
  | "inactive"
  | "pending"
  | "generating"
  | "generated";

const statusStyles: Record<Status, string> = {
  published: "bg-success/10 text-success",
  active: "bg-success/10 text-success",
  draft: "bg-muted text-muted-foreground",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-info/10 text-info",
  generating: "bg-info/10 text-info",
  generated: "bg-success/10 text-success",
};

const statusLabels: Record<Status, string> = {
  published: "Published",
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
  pending: "Pending",
  generating: "Generating",
  generated: "Generated",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status.toLowerCase() as Status;
  const style = statusStyles[key] ?? "bg-muted text-muted-foreground";
  const label = statusLabels[key] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
