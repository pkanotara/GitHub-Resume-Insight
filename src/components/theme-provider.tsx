"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const Provider = NextThemesProvider as any;
  return (
    <Provider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </Provider>
  );
}
