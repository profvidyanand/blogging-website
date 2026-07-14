import { ForceDarkMode } from "@/components/admin/force-dark-mode";

// Runs before hydration so the admin panel never flashes the light theme on
// a hard navigation/refresh. `ForceDarkMode` keeps it in sync afterwards and
// reverts it when leaving the admin section.
const NO_FLASH_DARK_SCRIPT = "document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: NO_FLASH_DARK_SCRIPT }}
      />
      <ForceDarkMode />
      {children}
    </>
  );
}
