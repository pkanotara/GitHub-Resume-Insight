import { GithubRepo, GithubUser } from "@/types/github";

export async function fetchGithubUser(username: string): Promise<GithubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    // Avoid Next caching when running on server during dev
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return (await res.json()) as GithubUser;
}

export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch repos");
  const repos = (await res.json()) as GithubRepo[];
  // Filter out forks and sort by stars desc
  return repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}
