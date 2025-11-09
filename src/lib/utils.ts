import { clsx } from "clsx";

export function cn(...inputs: any[]) {
  return clsx(inputs);
}

export function extractGithubUsername(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  // Look for full links like https://github.com/username or github.com/username
  const linkRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/(?<user>[a-z0-9-]+)(?:\b|\/)/i;
  const linkMatch = lower.match(linkRegex);
  if (linkMatch && (linkMatch.groups as any)?.user) {
    return (linkMatch.groups as any).user;
  }
  // Look for patterns like "GitHub: username" or "Github - username"
  const labelRegex = /github\s*[:\-]\s*(?<user>[a-z0-9-]+)/i;
  const labelMatch = lower.match(labelRegex);
  if (labelMatch && (labelMatch.groups as any)?.user) {
    return (labelMatch.groups as any).user;
  }
  // Fallback: an @username next to the word github
  const atRegex = /github[^\n\r@]*@(?<user>[a-z0-9-]+)/i;
  const atMatch = lower.match(atRegex);
  if (atMatch && (atMatch.groups as any)?.user) {
    return (atMatch.groups as any).user;
  }
  return null;
}
