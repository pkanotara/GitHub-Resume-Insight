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
import { Github as GithubIcon } from "lucide-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900 dark:from-zinc-950 dark:to-zinc-900 dark:text-zinc-100`}
      >
        <ThemeProvider>
          <header className="sticky top-0 z-30 w-full border-b border-zinc-200/60 bg-white/70 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800/60 dark:bg-zinc-900/60">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                  <GithubIcon size={16} />
                </span>
                <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">GitHub Resume Insight</span>
              </div>
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
