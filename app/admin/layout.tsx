import { ForceDarkMode } from "@/components/admin/force-dark-mode";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ForceDarkMode />
      {children}
    </>
  );
}
