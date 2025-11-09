"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const current = theme === "system" ? systemTheme : theme;
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-full border border-zinc-700/40 bg-zinc-900/50 px-2 py-2 text-zinc-300 shadow-sm backdrop-blur transition hover:scale-105 hover:text-zinc-100 dark:border-zinc-200/20 dark:bg-white/5"
    >
      {current === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
