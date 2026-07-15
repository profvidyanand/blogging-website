import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

function LoadingLabel({
  loading,
  label,
  loadingLabel,
  className,
}: {
  loading: boolean;
  label: React.ReactNode;
  loadingLabel: React.ReactNode;
  className?: string;
}) {
  if (!loading) return label;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Spinner className="size-4 shrink-0" />
      {loadingLabel}
    </span>
  );
}

export { Spinner, LoadingLabel };
