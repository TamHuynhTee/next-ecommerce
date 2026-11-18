import "server-only";

import { API_URL } from "@/lib/auth/constants";
import { getSession } from "@/lib/auth/session";
import type { OrderResult } from "./types";

/**
 * Calls the orders API on behalf of the signed-in user. Reads the session
 * cookie, so callers must run per request (server actions, or under <Suspense>).
 */
export async function orderRequest<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<OrderResult<T>> {
  const session = await getSession();
  if (!session) return { ok: false, error: "UNAUTHENTICATED" };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/orders${path}`, {
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
    const message = data?.message;
    return {
      ok: false,
      error: typeof message === "string" ? message : "INVALID_INPUT",
      details: Array.isArray(message) ? message : undefined,
      issues: Array.isArray(data?.issues) ? data.issues : undefined,
    };
  }
  return { ok: true, data: (await res.json()) as T };
}
