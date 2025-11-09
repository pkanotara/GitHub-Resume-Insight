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
  const isDark = current === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-9 w-[76px] items-center rounded-full border border-white/10 bg-zinc-900/40 p-1 text-zinc-300 shadow-sm backdrop-blur transition-all hover:scale-[1.02] dark:border-zinc-300/20 dark:bg-white/60"
    >
      <span
        className="pointer-events-none absolute inset-1 w-[calc(50%-2px)] rounded-full bg-white/10 shadow-md transition-transform duration-300 ease-out dark:bg-zinc-900/10"
        style={{ transform: isDark ? "translateX(0%)" : "translateX(100%)" }}
      />
      <span className={`relative z-10 flex-1 text-center ${isDark ? "text-emerald-400" : "text-zinc-400"}`}>
        <Moon size={16} />
      </span>
      <span className={`relative z-10 flex-1 text-center ${!isDark ? "text-emerald-500" : "text-zinc-400"}`}>
        <Sun size={16} />
      </span>
    </button>
  );
}
