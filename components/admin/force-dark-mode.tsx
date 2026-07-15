"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useEffect } from "react";

// Runs before hydration so the admin panel never flashes the light theme on
// a hard navigation/refresh. Injected via useServerInsertedHTML so React 19
// does not warn about inline <script> tags inside the component tree.
const NO_FLASH_DARK_SCRIPT =
  "document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';";

/**
 * The admin panel is always dark, regardless of the visitor's system/site
 * theme preference. This toggles the `dark` class (and native color-scheme)
 * on the document root so every themed primitive -- including portaled
 * dialogs, sheets, selects and dropdowns that render into <body> -- picks up
 * the dark palette defined in globals.css. The class is removed on unmount
 * so navigating back to the public site restores the light theme.
 */
export function ForceDarkMode() {
  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: NO_FLASH_DARK_SCRIPT }} />
  ));

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const previousColorScheme = root.style.colorScheme;

    root.classList.add("dark");
    root.style.colorScheme = "dark";

    return () => {
      if (!hadDark) root.classList.remove("dark");
      root.style.colorScheme = previousColorScheme;
    };
  }, []);

  return null;
}
