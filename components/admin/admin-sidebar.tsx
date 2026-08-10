"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  ExternalLink,
  LogOut,
  Settings,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { LoadingLabel } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

const contentNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
  { href: "/admin/extra-buttons", label: "Extra buttons", icon: MousePointerClick },
];

export function AdminSidebar({
  email,
  className,
  onNavigate,
}: {
  email: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      onNavigate?.();
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className={cn(
        "flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      <div className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-semibold text-sidebar-foreground"
        >
          Admin Panel
        </Link>
        <p className="mt-1 truncate text-caption">{email}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Content
        </p>
        {contentNav.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Settings
        </p>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <ExternalLink className="size-4" />
          Public site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <LogOut className="size-4" />
          <LoadingLabel
            loading={loggingOut}
            label="Log out"
            loadingLabel="Logging out…"
          />
        </button>
      </div>
    </aside>
  );
}
