import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/articles", label: "Articles" },
];

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-4 py-4">
          <Link href="/admin" className="font-semibold">
            Admin Panel
          </Link>
          <p className="mt-1 truncate text-xs text-zinc-500">{admin.email}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-200 p-3">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-800">
            ← Public site
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-zinc-200 bg-white px-6">
          <span className="text-sm text-zinc-500">AI Blog Admin</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
