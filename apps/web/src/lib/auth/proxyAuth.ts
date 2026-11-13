import { NextResponse } from "next/server";
import { API_URL } from "./constants";
import { setAccessTokenCookie } from "./cookie";

/**
 * Forwards credentials to the API, stores the returned token in an httpOnly
 * cookie and returns the API error payload unchanged on failure.
 */
export async function forwardAuth(apiPath: string, body: unknown) {
  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_URL}${apiPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "API unavailable" }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => ({}));
  if (!apiRes.ok || !data.access_token) {
    return NextResponse.json(data, { status: apiRes.status || 500 });
  }

  const res = NextResponse.json({ success: true });
  setAccessTokenCookie(res, data.access_token);
  return res;
}
