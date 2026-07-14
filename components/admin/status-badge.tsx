import { cn } from "@/lib/utils";

type Status =
  | "published"
  | "draft"
  | "scheduled"
  | "active"
  | "inactive"
  | "pending"
  | "generating";

const statusStyles: Record<Status, string> = {
  published: "bg-success/10 text-success",
  active: "bg-success/10 text-success",
  draft: "bg-muted text-muted-foreground",
  inactive: "bg-muted text-muted-foreground",
  scheduled: "bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-warning",
  pending: "bg-info/10 text-info",
  generating: "bg-info/10 text-info",
};

const statusLabels: Record<Status, string> = {
  published: "Published",
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
  scheduled: "Scheduled",
  pending: "Pending",
  generating: "Generating",
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
