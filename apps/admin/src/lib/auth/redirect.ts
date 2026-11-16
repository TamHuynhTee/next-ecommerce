/** Returns the path only if it is a safe same-origin relative path (blocks open redirects). */
export function getSafeRedirect(path?: string | null): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return null;
  return path;
}
