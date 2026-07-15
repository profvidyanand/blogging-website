"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LoadingLabel } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

const routeLabels: Record<string, string> = {
  admin: "Dashboard",
  categories: "Categories",
  articles: "Articles",
  edit: "Edit",
};

function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return <span className="text-body-sm text-muted-foreground">Dashboard</span>;
  }

  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`;
    const seg = segments[i];
    const label =
      routeLabels[seg] ??
      (seg.length > 20 ? `${seg.slice(0, 8)}…` : seg);
    crumbs.push({ label, href: path });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-body-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 ? (
            <ChevronRight className="size-3.5 text-muted-foreground" />
          ) : null}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function UserAvatar({ email }: { email: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = email.slice(0, 2).toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {initials}
        </div>
        <span className="hidden text-body-sm text-muted-foreground sm:inline">
          {email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut />
          <LoadingLabel
            loading={loggingOut}
            label="Log out"
            loadingLabel="Logging out…"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminTopbar({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="lg:hidden" />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0" showCloseButton>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AdminSidebar email={email} className="w-full border-0" />
          </SheetContent>
        </Sheet>
        <AdminBreadcrumbs />
      </div>
      <UserAvatar email={email} />
    </header>
  );
}
