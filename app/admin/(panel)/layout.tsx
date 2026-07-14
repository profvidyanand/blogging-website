import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="hidden lg:block">
        <AdminSidebar email={admin.email ?? ""} className="fixed inset-y-0 left-0 z-30" />
      </div>
      <div className="flex min-h-screen flex-1 flex-col lg:pl-56">
        <AdminTopbar email={admin.email ?? ""} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
