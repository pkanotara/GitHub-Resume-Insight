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
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [resumeText, setResumeText] = useState("");
  const [username, setUsername] = useState<string | null>(null);
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

  async function detectAndFetch(text: string) {
    const userFromText = extractGithubUsername(text);
    if (!userFromText) {
      setUsername(null);
      setUser(null);
      setRepos([]);
      setError("No GitHub profile link found in the resume.");
      return;
    }
    setUsername(userFromText);
    setError(null);
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        fetchGithubUser(userFromText),
        fetchGithubRepos(userFromText),
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
    setUser(null);
    setRepos([]);
    setError(null);
  };

  return (
    <main className="container py-12 pb-20">
      {/* Hero */}
      <section className="mb-12 text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 shadow-lg shadow-emerald-500/10 backdrop-blur-sm dark:border-emerald-600/30 dark:bg-emerald-600/10 dark:text-emerald-600">
          <GithubIcon size={16} className="animate-pulse" /> GitHub Resume Insight
        </div>
        <h1 className="bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl dark:from-zinc-900 dark:via-zinc-700 dark:to-zinc-500">
          Discover GitHub Talent
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 dark:text-zinc-600">
          Upload a resume or paste the text to automatically extract and display
          GitHub profile insights with beautiful visualizations.
        </p>
      </section>

      {/* Mode Switch */}
      <div className="mx-auto mb-8 flex w-full max-w-md items-center justify-center gap-1 rounded-full border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-1 shadow-lg backdrop-blur-sm dark:border-zinc-300/20 dark:from-zinc-900/40 dark:to-zinc-900/20">
        <button
          onClick={() => setMode("file")}
          className={`flex-1 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
            mode === "file"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
              : "text-zinc-400 hover:text-zinc-200 dark:text-zinc-600 dark:hover:text-zinc-800"
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex-1 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
            mode === "text"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
              : "text-zinc-400 hover:text-zinc-200 dark:text-zinc-600 dark:hover:text-zinc-800"
          }`}
        >
          Paste Text
        </button>
      </div>

      {/* Input Area */}
      {mode === "file" ? (
        <section className="mx-auto mb-12 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-gradient-to-br from-black/30 via-black/20 to-transparent p-10 text-center shadow-2xl ring-1 ring-white/5 backdrop-blur-xl transition-all hover:border-emerald-500/50 hover:shadow-emerald-500/10 dark:from-white/50 dark:via-white/40 dark:to-white/30 dark:ring-zinc-900/10">
            <div
              {...(getRootProps() as any)}
              className={`cursor-pointer rounded-xl p-10 transition-all duration-300 ${
                isDragActive ? "scale-[1.02] bg-emerald-500/20 ring-2 ring-emerald-500/50" : "hover:bg-white/5 dark:hover:bg-black/5"
              }`}
            >
              <input {...(getInputProps() as any)} />
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
                <Upload className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-base font-medium text-zinc-200 dark:text-zinc-800">
                Drag and drop your resume here
              </p>
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-600">
                or click to browse
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                <span className="rounded-full bg-white/5 px-2 py-1">PDF</span>
                <span className="rounded-full bg-white/5 px-2 py-1">DOCX</span>
                <span className="rounded-full bg-white/5 px-2 py-1">TXT</span>
              </div>
            </div>
            {acceptedFiles?.[0] && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                  <FileText size={16} />
                  <span className="font-medium">{acceptedFiles[0].name}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="mx-auto mb-12 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-black/30 via-black/20 to-transparent p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl dark:from-white/60 dark:via-white/50 dark:to-white/40 dark:ring-zinc-900/10">
            <label className="mb-3 block text-sm font-semibold text-zinc-200 dark:text-zinc-800">
              Paste Resume Text
            </label>
            <textarea
              className="h-48 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-5 text-sm leading-relaxed text-zinc-200 outline-none ring-emerald-500/0 transition-all placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-300/30 dark:bg-white dark:text-zinc-800 dark:placeholder:text-zinc-400"
              placeholder="Paste the resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={reset}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur transition-all hover:bg-white/10 hover:text-zinc-100 dark:border-zinc-300/30 dark:bg-black/5 dark:text-zinc-700 dark:hover:bg-black/10"
              >
                Clear
              </button>
              <button
                onClick={() => detectAndFetch(resumeText)}
                disabled={!resumeText.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <FileText size={16} /> Detect GitHub
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="mx-auto w-full max-w-5xl">
        {loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-black/40 via-black/30 to-transparent p-8 shadow-xl backdrop-blur-xl dark:border-emerald-600/30 dark:from-white/70 dark:via-white/60 dark:to-white/50">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <span className="text-base font-medium text-zinc-200 dark:text-zinc-800">Processing...</span>
          </div>
        )}
        {error && (
          <div className="animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-transparent p-6 shadow-xl backdrop-blur-xl dark:border-rose-600/30 dark:from-rose-100 dark:to-rose-50">
            <p className="text-sm leading-relaxed text-rose-200 dark:text-rose-800">{error}</p>
          </div>
        )}

        {user && (
          <div className="animate-in fade-in slide-in-from-bottom-6 space-y-8 duration-700">
            {/* Profile Card */}
            <div className="group rounded-3xl border border-white/10 bg-gradient-to-br from-black/40 via-black/30 to-transparent p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-zinc-300/30 dark:from-white/70 dark:via-white/60 dark:to-white/50 dark:ring-zinc-900/10">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-75 blur-md"></div>
                    <Image
                      src={user.avatar_url}
                      alt={user.login}
                      width={80}
                      height={80}
                      className="relative h-20 w-20 rounded-full ring-4 ring-black/20 dark:ring-white/20"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100 dark:text-zinc-900">
                      {user.name || user.login}
                    </h2>
                    <p className="mt-0.5 text-sm text-emerald-400 dark:text-emerald-600">
                      @{user.login}
                    </p>
                    {user.bio && (
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 dark:text-zinc-600">
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
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 backdrop-blur transition-all hover:scale-[1.02] hover:border-emerald-500/30 hover:bg-white/10 hover:text-zinc-100 dark:border-zinc-300/30 dark:bg-zinc-900/10 dark:text-zinc-800 dark:hover:bg-zinc-900/20"
                  >
                    <GithubIcon size={16} /> View on GitHub
                  </a>
                  <button
                    onClick={reset}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 backdrop-blur transition-all hover:bg-white/10 hover:text-zinc-100 dark:border-zinc-300/30 dark:bg-zinc-900/10 dark:text-zinc-700 dark:hover:bg-zinc-900/20"
                  >
                    Analyze Another
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-6 border-t border-white/5 pt-5 text-sm dark:border-zinc-900/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <GithubIcon size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-600">Repositories</p>
                    <p className="font-semibold text-zinc-200 dark:text-zinc-800">{user.public_repos}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Star size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-600">Followers</p>
                    <p className="font-semibold text-zinc-200 dark:text-zinc-800">{user.followers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <ExternalLink size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-600">Following</p>
                    <p className="font-semibold text-zinc-200 dark:text-zinc-800">{user.following}</p>
                  </div>
                </div>
                {languages.length > 0 && (
                  <div className="flex-1">
                    <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-600">Top Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {languages.slice(0, 3).map(([lang]) => (
                        <span key={lang} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 dark:text-emerald-600">
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
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-200 dark:text-zinc-800">
                  Public Repositories
                  <span className="ml-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-sm font-medium text-emerald-400 dark:text-emerald-600">
                    {repos.length}
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {repos.slice(0, 24).map((repo, idx) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="group animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-white/10 bg-gradient-to-br from-black/40 via-black/30 to-transparent p-5 shadow-lg ring-1 ring-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-2xl hover:shadow-emerald-500/20 dark:border-zinc-300/30 dark:from-white/70 dark:via-white/60 dark:to-white/50 dark:ring-zinc-900/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold text-emerald-400 transition-colors group-hover:text-emerald-300 dark:text-emerald-600 dark:group-hover:text-emerald-500">
                          {repo.name}
                        </h4>
                        {repo.description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-600">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-400 dark:text-amber-600">
                        <Star size={13} className="fill-amber-400/50 dark:fill-amber-600/50" />
                        {repo.stargazers_count}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs dark:border-zinc-900/10">
                      <span className="rounded-full bg-white/5 px-2.5 py-1 font-medium text-zinc-400 dark:bg-zinc-900/10 dark:text-zinc-600">
                        {repo.language || "Markdown"}
                      </span>
                      <ExternalLink size={14} className="text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400 dark:group-hover:text-emerald-600" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer Blurb */}
      <footer className="mt-16 text-center text-xs text-zinc-500 dark:text-zinc-600">
        No data stored. Uses the public GitHub API.
      </footer>
    </main>
  );
}
