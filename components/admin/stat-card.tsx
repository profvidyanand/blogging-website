import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardContent className="flex items-start justify-between pt-6">
        <div>
          <p className="text-caption font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-h2 tabular-nums">{value}</p>
          {description ? (
            <p className="mt-1 text-caption">{description}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
