import { useEffect, useLayoutEffect, useState } from "react";

export const useThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Set initial theme before paint to avoid flicker and ensure correctness
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("neuropath_theme");
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      const enableDark = saved ? saved === "dark" : prefersDark;
      setIsDarkMode(enableDark);
      document.documentElement.classList.toggle("dark", enableDark);
    } catch {
      // no-op
    }
  }, []);

  // Sync theme across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "neuropath_theme") return;
      const val = e.newValue === "dark";
      setIsDarkMode(val);
      document.documentElement.classList.toggle("dark", val);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("neuropath_theme", next ? "dark" : "light");
      } catch {
        // no-op
      }
      return next;
    });
  };

  return { isDarkMode, toggleTheme };
};
