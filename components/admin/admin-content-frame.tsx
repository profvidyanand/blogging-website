"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getAdminSkeletonForPath } from "@/lib/admin-skeleton-routes";

/**
 * Shows route-appropriate skeletons during client navigations without
 * file-based loading.tsx (nested Suspense breaks RSC streaming on Workers).
 */
export function AdminContentFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settledPath, setSettledPath] = useState(pathname);

  const navigating = pathname !== settledPath;

  useEffect(() => {
    setSettledPath(pathname);
  }, [children, pathname]);

  if (navigating) {
    return getAdminSkeletonForPath(pathname);
  }

  return children;
}
