import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Hide this column in the mobile card layout */
  hideOnMobile?: boolean;
  /** Render as the card title on mobile */
  mobileTitle?: boolean;
  /** Pin to the top-right of the mobile card */
  mobileActions?: boolean;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No rows found.",
  emptyTitle = "Nothing here yet",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  emptyTitle?: string;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        title={emptyTitle}
        description={emptyMessage}
      />
    );
  }

  const titleColumn =
    columns.find((col) => col.mobileTitle) ?? columns[0];
  const actionColumn = columns.find((col) => col.mobileActions);
  const mobileBodyColumns = columns.filter(
    (col) =>
      col !== titleColumn &&
      !col.hideOnMobile &&
      !col.mobileTitle &&
      !col.mobileActions &&
      col.header,
  );

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-lg border border-border bg-card p-4 shadow-card"
          >
            <div className="min-w-0">{titleColumn.cell(row)}</div>
            {actionColumn ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                {actionColumn.cell(row)}
              </div>
            ) : null}
            {mobileBodyColumns.length > 0 ? (
              <dl
                className={cn(
                  "space-y-2",
                  actionColumn ? "mt-3" : "mt-3 border-t border-border pt-3",
                )}
              >
                {mobileBodyColumns.map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <dt className="shrink-0 text-muted-foreground">
                      {col.header}
                    </dt>
                    <dd className="min-w-0 text-right">{col.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card shadow-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(col.className, col.mobileTitle && "max-w-[200px] truncate lg:max-w-none")}
                  >
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
