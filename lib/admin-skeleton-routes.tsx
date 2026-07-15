import {
  AdminDashboardSkeleton,
  AdminDetailSkeleton,
  AdminFormSkeleton,
  AdminTableSkeleton,
} from "@/components/loading/page-skeletons";

/** Client-safe route → skeleton mapping (no file-based loading.tsx). */
export function getAdminSkeletonForPath(pathname: string) {
  if (/^\/admin\/articles\/[^/]+\/edit\/?$/.test(pathname)) {
    return <AdminFormSkeleton />;
  }
  if (/^\/admin\/articles\/[^/]+\/?$/.test(pathname)) {
    return <AdminDetailSkeleton />;
  }
  if (pathname === "/admin/articles" || pathname.startsWith("/admin/articles?")) {
    return <AdminTableSkeleton />;
  }
  if (/^\/admin\/categories\/[^/]+\/?$/.test(pathname)) {
    return <AdminTableSkeleton filters={false} />;
  }
  if (pathname === "/admin/categories" || pathname.startsWith("/admin/categories?")) {
    return <AdminTableSkeleton />;
  }
  if (pathname === "/admin" || pathname === "/admin/") {
    return <AdminDashboardSkeleton />;
  }
  return <AdminDashboardSkeleton />;
}
