import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitHub Resume Insight",
  description: "Extract GitHub profiles from resumes and visualize public repos.",
};

import { ThemeProvider } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100 dark:from-zinc-50 dark:to-white dark:text-zinc-900`}
      >
        <ThemeProvider>
          <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-black/30 px-6 py-4 backdrop-blur dark:border-zinc-200/20 dark:bg-white/60">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium tracking-tight">
                <span className="text-emerald-400"></span>
                <span className="text-zinc-100 dark:text-zinc-900">GitHub Resume Insight</span>
              </div>
              <ThemeToggle />
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
