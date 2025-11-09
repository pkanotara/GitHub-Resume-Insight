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
    <main className="container py-12">
      {/* Hero */}
      <section className="mb-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 dark:border-zinc-300/30 dark:bg-black/5 dark:text-zinc-700">
          <GithubIcon size={14} /> GitHub Resume Insight
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Discover GitHub Talent
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-400 dark:text-zinc-600">
          Upload a resume or paste the text to automatically extract and display
          GitHub profile insights.
        </p>
      </section>

      {/* Mode Switch */}
      <div className="mx-auto mb-6 flex w-full max-w-3xl items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 dark:border-zinc-300/30 dark:bg-black/5">
        <button
          onClick={() => setMode("file")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm transition ${
            mode === "file"
              ? "bg-emerald-500 text-white"
              : "text-zinc-300 hover:bg-white/10 dark:text-zinc-700"
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm transition ${
            mode === "text"
              ? "bg-emerald-500 text-white"
              : "text-zinc-300 hover:bg-white/10 dark:text-zinc-700"
          }`}
        >
          Paste Text
        </button>
      </div>

      {/* Input Area */}
      {mode === "file" ? (
        <section className="mx-auto mb-10 w-full max-w-3xl rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center shadow-2xl ring-1 ring-white/5 backdrop-blur dark:bg-white/40 dark:ring-zinc-900/10">
          <div
            {...(getRootProps() as any)}
            className={`cursor-pointer rounded-xl p-8 transition ${
              isDragActive ? "bg-emerald-500/20" : ""
            }`}
          >
            <input {...(getInputProps() as any)} />
            <Upload className="mx-auto mb-4 text-emerald-400" />
            <p className="text-sm text-zinc-300 dark:text-zinc-700">
              Drag and drop your resume here, or click to browse
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-600">
              Supported: PDF, DOCX, TXT
            </p>
          </div>
          {acceptedFiles?.[0] && (
            <p className="mt-3 truncate text-xs text-zinc-400 dark:text-zinc-600">
              Selected: {acceptedFiles[0].name}
            </p>
          )}
        </section>
      ) : (
        <section className="mx-auto mb-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-black/20 p-6 shadow-2xl ring-1 ring-white/5 backdrop-blur dark:bg-white/60 dark:ring-zinc-900/10">
          <label className="mb-2 block text-sm font-medium text-zinc-200 dark:text-zinc-800">
            Paste Resume Text
          </label>
          <textarea
            className="h-40 w-full resize-none rounded-lg border border-white/10 bg-black/40 p-4 text-sm outline-none placeholder:text-zinc-500 focus:border-emerald-500 dark:border-zinc-300/30 dark:bg-white dark:placeholder:text-zinc-400"
            placeholder="Paste the resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={reset}
              className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 dark:border-zinc-300/30 dark:text-zinc-700"
            >
              Clear
            </button>
            <button
              onClick={() => detectAndFetch(resumeText)}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <FileText size={16} /> Detect GitHub
            </button>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="mx-auto w-full max-w-5xl">
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 p-6 text-sm text-zinc-300 dark:border-zinc-300/30 dark:bg-white/60 dark:text-zinc-700">
            <Loader2 className="animate-spin" /> Processing...
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 dark:bg-rose-50 dark:text-rose-700">
            {error}
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow ring-1 ring-white/5 dark:border-zinc-300/30 dark:bg-white dark:ring-zinc-900/5">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-4">
                  <Image
                    src={user.avatar_url}
                    alt={user.login}
                    width={72}
                    height={72}
className="h-[72px] w-[72px] rounded-full ring-2 ring-white/20"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">
                      {user.name || user.login}
                    </h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600">
                      @{user.login}
                    </p>
                    {user.bio && (
                      <p className="mt-2 max-w-2xl text-sm text-zinc-300 dark:text-zinc-700">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={user.html_url}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10 dark:border-zinc-300/30 dark:bg-white dark:text-zinc-800"
                  >
                    View on GitHub <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={reset}
                    className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 dark:border-zinc-300/30 dark:text-zinc-700"
                  >
                    Analyze Another Resume
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-400 dark:text-zinc-600">
                <span>Repos: {user.public_repos}</span>
                <span>Followers: {user.followers}</span>
                <span>Following: {user.following}</span>
                {languages.length > 0 && (
                  <span>
                    Top Languages: {languages.slice(0, 3).map((l) => l[0]).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Repos Grid */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-zinc-300 dark:text-zinc-700">
                Public Repositories ({repos.length})
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {repos.slice(0, 24).map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    className="group rounded-xl border border-white/10 bg-black/30 p-4 shadow transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-emerald-500/10 dark:border-zinc-300/30 dark:bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-emerald-400 group-hover:text-emerald-300">
                          {repo.name}
                        </h4>
                        {repo.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-400 dark:text-zinc-600">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-200 dark:border-zinc-300/30 dark:bg-zinc-50 dark:text-zinc-700">
                        <Star size={14} className="text-amber-400" />
                        {repo.stargazers_count}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-600">
                      <span>{repo.language || "Other"}</span>
                      <ExternalLink size={14} />
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
