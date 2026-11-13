/**
 * Returns the given path only if it is a safe same-origin relative path.
 * Blocks open redirects such as "//evil.com" or "https://evil.com".
 */
export function getSafeRedirect(path?: string | null): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("\\")) return null;
  return path;
}

export function buildSigninUrl(redirectPath: string): string {
  return `/signin?redirect=${encodeURIComponent(redirectPath)}`;
}
