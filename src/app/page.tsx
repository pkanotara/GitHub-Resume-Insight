"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractGithubUsername } from "@/lib/utils";
import { fetchGithubRepos, fetchGithubUser } from "@/lib/github";
import type { GithubRepo, GithubUser } from "@/types/github";
import {
  Github as GithubIcon,
  Upload,
  FileText,
  ExternalLink,
  Star,
  Loader2,
  Search,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [mode, setMode] = useState<"file" | "username">("file");
  const [resumeText, setResumeText] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles?.length) return;
    const file = acceptedFiles[0];
    await handleFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
          ".docx",
        ],
        "text/plain": [".txt"],
      },
      onDrop,
      multiple: false,
    } as any);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to read file");
      const text: string = data.text || "";
      setResumeText(text);
      await detectAndFetch(text);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchByUsername(input: string) {
    const value = input.trim().replace(/^@/, "");
    if (!value) return;
    setError(null);
    setLoading(true);
    setUsername(value);
    try {
      const [u, r] = await Promise.all([
        fetchGithubUser(value),
        fetchGithubRepos(value),
      ]);
      setUser(u);
      setRepos(r);
    } catch (e: any) {
      setError(e.message || "Failed to fetch GitHub data");
      setUser(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }

  async function detectAndFetch(text: string) {
    const userFromText = extractGithubUsername(text);
    if (!userFromText) {
      setUsername(null);
      setUser(null);
      setRepos([]);
      setError("No GitHub profile link found in the resume.");
      return;
    }
    await fetchByUsername(userFromText);
  }

  const languages = useMemo(() => {
    const map = new Map<string, number>();
    repos.forEach((r) => {
      if (!r.language) return;
      map.set(r.language, (map.get(r.language) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [repos]);

  const reset = () => {
    setResumeText("");
    setUsername(null);
    setUsernameInput("");
    setUser(null);
    setRepos([]);
    setError(null);
  };

  const stage = loading ? "processing" : user ? "results" : "input";

  return (
    <main className="container py-12 pb-20">
      {/* Hero */}
      <section className="mb-8 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-600 shadow-sm backdrop-blur dark:text-emerald-400">
          <GithubIcon size={16} className="animate-pulse" /> GitHub Resume Insight
        </div>
        <h1 className="bg-gradient-to-br from-zinc-900 to-zinc-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl dark:from-zinc-100 dark:to-zinc-400">
          Discover GitHub Talent
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Upload a resume or enter a GitHub username to instantly visualize profile insights.
        </p>
      </section>

      {/* Input / Loader / Results switcher */}
      {stage === "input" && (
        <>
          {/* Mode Switch */}
          <div className="mx-auto mb-8 flex w-full max-w-md items-center justify-center gap-1 rounded-full border border-zinc-200/60 bg-white/70 p-1 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/40">
            <button
              onClick={() => setMode("file")}
              className={`flex-1 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                mode === "file"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setMode("username")}
              className={`flex-1 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                mode === "username"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              GitHub Username
            </button>
          </div>

          {/* Input Area */}
          {mode === "file" ? (
            <section className="mx-auto mb-10 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-10 text-center shadow-xl backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/60">
                <div
                  {...(getRootProps() as any)}
                  className={`cursor-pointer rounded-xl p-10 transition-all duration-300 ${
                    isDragActive ? "scale-[1.02] bg-emerald-500/10 ring-2 ring-emerald-500/40" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <input {...(getInputProps() as any)} />
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
                    <Upload className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                    Drag and drop your resume here
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">or click to browse</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                    <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/5">PDF</span>
                    <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/5">DOCX</span>
                    <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/5">TXT</span>
                  </div>
                </div>
                {acceptedFiles?.[0] && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <FileText size={16} />
                      <span className="font-medium">{acceptedFiles[0].name}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="mx-auto mb-10 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-8 shadow-xl backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/60">
                <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-zinc-100">GitHub Username</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500">
                      <GithubIcon size={16} />
                    </span>
                    <input
                      type="text"
                      inputMode="text"
                      spellCheck={false}
                      autoComplete="off"
                      placeholder="e.g. torvalds, gaearon, octocat"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && usernameInput.trim()) {
                          fetchByUsername(usernameInput);
                        }
                      }}
                      className="w-full rounded-xl border border-zinc-200/60 bg-white py-3 pl-9 pr-3 text-sm text-zinc-900 outline-none ring-emerald-500/0 transition-all placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="inline-flex items-center rounded-lg border border-zinc-200/60 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur transition-all hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => fetchByUsername(usernameInput)}
                      disabled={!usernameInput.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Search size={16} /> Fetch
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {error && (
            <div className="mx-auto w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-rose-500/30 bg-rose-50 p-5 text-rose-700 shadow-sm dark:border-rose-600/30 dark:bg-rose-950/30 dark:text-rose-300">
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          )}
        </>
      )}

      {stage === "processing" && (
        <section className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-200/60 bg-white/70 p-8 shadow-xl backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/60">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span className="text-base font-medium text-zinc-700 dark:text-zinc-200">Processing...</span>
          </div>
        </section>
      )}

      {stage === "results" && user && (
        <section className="mx-auto w-full max-w-5xl space-y-8">
          {/* Profile Card */}
          <div className="group rounded-2xl border border-zinc-200/60 bg-white/70 p-8 shadow-xl backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/60">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-75 blur-md"></div>
                  <Image
                    src={user.avatar_url}
                    alt={user.login}
                    width={80}
                    height={80}
                    className="relative h-20 w-20 rounded-full ring-4 ring-white dark:ring-zinc-800"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {user.name || user.login}
                  </h2>
                  <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-400">@{user.login}</p>
                  {user.bio && (
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur transition-all hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <GithubIcon size={16} /> View on GitHub
                </a>
                <button
                  onClick={reset}
                  className="rounded-lg border border-zinc-200/60 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur transition-all hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Analyze Another
                </button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 border-t border-zinc-200/60 pt-5 text-sm dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <GithubIcon size={16} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Repositories</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.public_repos}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Star size={16} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Followers</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.followers}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ExternalLink size={16} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Following</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user.following}</p>
                </div>
              </div>
              {languages.length > 0 && (
                <div className="flex-1">
                  <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-500">Top Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {languages.slice(0, 3).map(([lang]) => (
                      <span key={lang} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Repos Grid */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Public Repositories
                <span className="ml-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {repos.length}
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {repos.slice(0, 24).map((repo, idx) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="group animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-zinc-200/60 bg-white/60 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-base font-semibold text-zinc-900 transition-colors group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400">
                        {repo.name}
                      </h4>
                      {repo.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Star size={13} className="fill-amber-500/40 dark:fill-amber-400/40" />
                      {repo.stargazers_count}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-200/60 pt-3 text-xs dark:border-zinc-800/60">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {repo.language || "Markdown"}
                    </span>
                    <ExternalLink size={14} className="text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer Blurb */}
      <footer className="mt-16 text-center text-xs text-zinc-500 dark:text-zinc-500">
        No data stored. Uses the public GitHub API.
      </footer>
    </main>
  );
}
