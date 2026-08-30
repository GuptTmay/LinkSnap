/**
 * Extracts domain/hostname from a long URL and returns Google Favicon service URL.
 */
export function getFaviconUrl(url: string, size: number = 64): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=${size}`;
  } catch {
    return "";
  }
}

/**
 * Safely extracts hostname from a URL string for display purposes.
 */
export function getDomainFromUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
