"use client";

import { useEffect, useState } from "react";
import ThemeContrastIcon from "./ThemeContrastIcon";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("wbtio-theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("wbtio-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-full border border-black/10 dark:border-white/[0.08]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
      title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
      className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-black shadow-sm transition-all hover:bg-black/[0.06] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
    >
      <ThemeContrastIcon
        size={17}
        className="transition-transform duration-300 group-hover:rotate-180"
      />
    </button>
  );
}
