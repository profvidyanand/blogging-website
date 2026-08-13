"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  EyeOff,
  FolderPlus,
  Pencil,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatActivityMessage } from "@/lib/activity-labels";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/lib/types";

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  "article.generate": Sparkles,
  "article.generate_faq": Sparkles,
  "article.update": Pencil,
  "article.delete": Trash2,
  "article.publish": CheckCircle2,
  "article.unpublish": EyeOff,
  "topic.update": Pencil,
  "topic.delete": Trash2,
  "topics.generate": Sparkles,
  "category.create": FolderPlus,
  "category.update": Pencil,
  "category.delete": Trash2,
};

export function RecentActivityCard({
  activities,
  entityLabels,
}: {
  activities: ActivityLog[];
  entityLabels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="shadow-card">
      <CardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="col-span-2 grid w-full grid-cols-[1fr_auto] items-center gap-2 text-left"
        >
          <CardTitle>Recent activity</CardTitle>
          <CardAction>
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </CardAction>
        </button>
      </CardHeader>
      {open ? (
        <CardContent>
          {activities.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Actions you take will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.action] ?? Pencil;
                const label = activity.entity_id
                  ? entityLabels[activity.entity_id]
                  : undefined;

                return (
                  <li
                    key={activity.id}
                    className="flex items-start justify-between gap-3 py-2.5 text-body-sm first:pt-0 last:pb-0"
                  >
                    <span className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="text-foreground">
                        {formatActivityMessage(activity, label)}
                      </span>
                    </span>
                    <time className="shrink-0 text-caption">
                      {new Date(activity.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}
