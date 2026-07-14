"use client";

import { useEffect } from "react";

/**
 * The admin panel is always dark, regardless of the visitor's system/site
 * theme preference. This toggles the `dark` class (and native color-scheme)
 * on the document root so every themed primitive -- including portaled
 * dialogs, sheets, selects and dropdowns that render into <body> -- picks up
 * the dark palette defined in globals.css. The class is removed on unmount
 * so navigating back to the public site restores the light theme.
 */
export function ForceDarkMode() {
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
