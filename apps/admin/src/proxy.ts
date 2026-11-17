import { NextRequest, NextResponse } from "next/server";

import { setSessionCookies } from "@/lib/auth/cookies";
import { ACCESS_TOKEN_COOKIE, REFRESH_LEEWAY_SECONDS, REFRESH_TOKEN_COOKIE, SIGN_IN_PATH } from "@/lib/auth/constants";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { refreshTokens } from "@/lib/auth/refresh";
import { decodeToken, userFromToken } from "@/lib/auth/token";

function needsRefresh(token: string | undefined): boolean {
  if (!token) return true;
  const exp = decodeToken(token)?.exp;
  return typeof exp !== "number" || exp * 1000 - REFRESH_LEEWAY_SECONDS * 1000 <= Date.now();
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  let token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const isSignIn = pathname === SIGN_IN_PATH;

  // Renew an expired (or about to expire) access token before rendering, so the session survives silently.
  let renewed: { access: string; refresh: string } | null = null;
  let sessionEnded = false;
  if (refreshToken && needsRefresh(token)) {
    const result = await refreshTokens(refreshToken);
    if (result.status === "ok" && userFromToken(result.tokens.access_token)) {
      renewed = { access: result.tokens.access_token, refresh: result.tokens.refresh_token };
      token = renewed.access;
      // Make the new cookies visible to server components rendered for this very request.
      req.cookies.set(ACCESS_TOKEN_COOKIE, renewed.access);
      req.cookies.set(REFRESH_TOKEN_COOKIE, renewed.refresh);
    } else if (result.status === "invalid" || result.status === "ok") {
      sessionEnded = true;
    }
  }

  const isAdmin = !!userFromToken(token);
  const withCookies = (res: NextResponse) => {
    if (renewed) setSessionCookies(res.cookies, renewed.access, renewed.refresh);
    return res;
  };

  // Server actions cannot follow an HTML redirect; let them through so apiFetch can redirect on a 401.
  if (!isAdmin && !isSignIn && req.headers.has("next-action")) return NextResponse.next();

  if (!isAdmin && !isSignIn) {
    const url = new URL(SIGN_IN_PATH, req.url);
    if (pathname !== "/") url.searchParams.set("redirect", pathname + search);
    const res = NextResponse.redirect(url);
    if (token || sessionEnded) res.cookies.delete(ACCESS_TOKEN_COOKIE);
    if (sessionEnded) res.cookies.delete(REFRESH_TOKEN_COOKIE);
    return res;
  }

  if (isAdmin && isSignIn) {
    const target = getSafeRedirect(req.nextUrl.searchParams.get("redirect"));
    return withCookies(NextResponse.redirect(new URL(target ?? "/", req.url)));
  }

  return withCookies(NextResponse.next({ request: req }));
}

export const config = {
  // Everything except Next.js internals and static files.
  matcher: ["/((?!_next/|favicon.ico|.*\\..*).*)"],
};
