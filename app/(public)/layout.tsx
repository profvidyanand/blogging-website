import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            AI Blog Platform
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            <Link href="/" className="hover:text-zinc-900">
              Home
            </Link>
            <Link href="/search" className="hover:text-zinc-900">
              Search
            </Link>
            <Link
              href="/admin"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-700"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} AI Blog Platform
      </footer>
    </div>
  );
}
