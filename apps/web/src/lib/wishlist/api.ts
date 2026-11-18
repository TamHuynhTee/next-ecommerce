import "server-only";

import { API_URL } from "@/lib/auth/constants";
import { getSession } from "@/lib/auth/session";
import type { WishlistActionResult, ServerWishlist } from "./types";

/**
 * Calls the wishlist API on behalf of the signed-in user. Reads the session
 * cookie, so callers must run per request (server actions, or under <Suspense>).
 */
export async function wishlistRequest(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown,
): Promise<WishlistActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "UNAUTHENTICATED" };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/wishlist${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${session.token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "UNAVAILABLE" };
  }

  if (res.status === 401) return { ok: false, error: "UNAUTHENTICATED" };
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      error:
        data?.message === "VARIANT_NOT_AVAILABLE"
          ? "VARIANT_NOT_AVAILABLE"
          : "UNAVAILABLE",
    };
  }
  return { ok: true, wishlist: (await res.json()) as ServerWishlist };
}
