export type AdminUser = {
  userId: string;
  email: string;
  name: string;
  initials: string;
  role: string;
};

type Payload = {
  sub?: string;
  exp?: number;
  user?: { email?: string; firstName?: string | null; lastName?: string | null; username?: string; role?: string };
};

/**
 * Decodes the JWT payload without verifying the signature.
 * The API stays the source of truth (JwtAuthGuard + RolesGuard); this is only a cheap pre-check.
 */
export function decodeToken(token: string): Payload | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(part), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: Payload | null): boolean {
  if (!payload) return true;
  return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
}

/** Returns the admin user for a valid, unexpired admin token, otherwise null. */
export function userFromToken(token: string | undefined): AdminUser | null {
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || isTokenExpired(payload) || payload.user?.role !== "admin") return null;
  const u = payload.user;
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || u.email || "Admin";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return { userId: payload.sub ?? "", email: u.email ?? "", name, initials, role: "Admin" };
}
