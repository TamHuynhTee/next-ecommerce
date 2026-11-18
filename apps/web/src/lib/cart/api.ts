import "server-only";

import { API_URL } from "@/lib/auth/constants";
import { getSession } from "@/lib/auth/session";
import type { CartActionError, CartActionResult, ServerCart } from "./types";

const KNOWN_ERRORS: CartActionError[] = [
  "OUT_OF_STOCK",
  "VARIANT_NOT_AVAILABLE",
  "CART_ITEM_NOT_FOUND",
];

/**
 * Calls the cart API on behalf of the signed-in user. Reads the session cookie,
 * so callers must run per request (server actions, or under <Suspense>).
 */
export async function cartRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<CartActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "UNAUTHENTICATED" };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/cart${path}`, {
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
    const known = KNOWN_ERRORS.find((code) => code === data?.message);
    return { ok: false, error: known ?? "UNAVAILABLE" };
  }
  return { ok: true, cart: (await res.json()) as ServerCart };
}
