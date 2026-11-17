import { API_URL } from "./constants";

export type TokenPair = { access_token: string; refresh_token: string };
export type RefreshResult = { status: "ok"; tokens: TokenPair } | { status: "invalid" } | { status: "unavailable" };

// Parallel requests (page + prefetches) often hit an expired token together; share one in-flight refresh per token.
const inflight = new Map<string, Promise<RefreshResult>>();

/** Exchanges a refresh token for a new token pair. "invalid" means the session is over; "unavailable" means retry later. */
export function refreshTokens(refreshToken: string): Promise<RefreshResult> {
  const existing = inflight.get(refreshToken);
  if (existing) return existing;

  const promise = (async (): Promise<RefreshResult> => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 400) return { status: "invalid" };
      if (!res.ok) return { status: "unavailable" };
      const tokens = (await res.json()) as Partial<TokenPair>;
      if (!tokens.access_token || !tokens.refresh_token) return { status: "unavailable" };
      return { status: "ok", tokens: tokens as TokenPair };
    } catch {
      return { status: "unavailable" };
    }
  })().finally(() => setTimeout(() => inflight.delete(refreshToken), 5000));

  inflight.set(refreshToken, promise);
  return promise;
}

/** Best-effort server-side revoke of the session behind a refresh token. */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/sign-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
  } catch {
    // The cookie is cleared regardless; the token expires on its own.
  }
}
