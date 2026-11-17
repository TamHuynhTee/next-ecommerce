import "server-only";

import { redirect } from "next/navigation";

import { API_URL, SIGN_IN_PATH } from "./auth/constants";
import { getAccessToken } from "./auth/session";

/** Error thrown for non-2xx API responses; `code` is the API message (e.g. SLUG_EXISTED). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(`API request failed: ${status} ${code}`);
  }
}

// Server-side HTTP client for the NestJS API. Attaches the admin JWT from the session cookie.
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  // Expired or missing session: send the user back to sign in instead of surfacing an error.
  if (res.status === 401) redirect(SIGN_IN_PATH);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? res.statusText);
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
