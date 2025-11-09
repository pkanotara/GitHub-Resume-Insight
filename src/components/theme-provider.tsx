"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const Provider = NextThemesProvider as any;
  return (
    <Provider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </Provider>
  );
}
