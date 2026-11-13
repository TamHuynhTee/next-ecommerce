import "server-only";
import { redirect } from "next/navigation";
import { API_URL } from "./constants";
import { buildSigninUrl } from "./redirect";
import { getSession } from "./session";

export type User = {
  id: string;
  username: string;
  email: string;
};

async function fetchUser(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.userId, username: data.username, email: data.email };
  } catch {
    // API unreachable: treat as unauthenticated.
    return null;
  }
}

/**
 * Data Access Layer entry point: validates the session against the API and
 * returns a narrow user object. `use cache: private` keeps the result in the
 * browser only, which lets the framework prefetch authenticated content.
 * redirect() throws, so redirects are never cached.
 */
export async function getCurrentUser(redirectPath: string): Promise<User> {
  "use cache: private";

  const session = await getSession();
  if (!session) redirect(buildSigninUrl(redirectPath));

  const user = await fetchUser(session.token);
  if (!user) redirect(buildSigninUrl(redirectPath));
  return user;
}

/** Same as getCurrentUser but returns null for guests instead of redirecting. */
export async function getOptionalUser(): Promise<User | null> {
  "use cache: private";

  const session = await getSession();
  return session ? fetchUser(session.token) : null;
}
