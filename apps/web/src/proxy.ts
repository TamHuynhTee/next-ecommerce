import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  GUEST_ONLY_PATHS,
  PROTECTED_PATHS,
  REFRESH_LEEWAY_SECONDS,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";
import { clearSessionCookies, setSessionCookies } from "@/lib/auth/cookie";
import { buildSigninUrl, getSafeRedirect } from "@/lib/auth/redirect";
import { refreshTokens } from "@/lib/auth/refresh";
import { getTokenExp, isTokenExpired } from "@/lib/auth/token";

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

function needsRefresh(token: string | undefined): boolean {
  if (!token) return true;
  const exp = getTokenExp(token);
  return (
    exp === null || exp * 1000 - REFRESH_LEEWAY_SECONDS * 1000 <= Date.now()
  );
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  let token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Renew an expired (or about to expire) access token before rendering, so
  // the header and protected pages keep working without a new sign-in.
  let renewed: { access: string; refresh: string } | null = null;
  let sessionEnded = false;
  if (refreshToken && needsRefresh(token)) {
    const result = await refreshTokens(refreshToken);
    if (result.status === "ok") {
      renewed = {
        access: result.tokens.access_token,
        refresh: result.tokens.refresh_token,
      };
      token = renewed.access;
      // Make the new cookies visible to server components rendered for this request.
      req.cookies.set(ACCESS_TOKEN_COOKIE, renewed.access);
      req.cookies.set(REFRESH_TOKEN_COOKIE, renewed.refresh);
    } else if (result.status === "invalid") {
      sessionEnded = true;
    }
  }

  const isAuthenticated = !!token && !isTokenExpired(token);
  const finish = (res: NextResponse) => {
    if (renewed) setSessionCookies(res, renewed.access, renewed.refresh);
    else if (sessionEnded) clearSessionCookies(res);
    return res;
  };

  if (matchesPath(pathname, PROTECTED_PATHS) && !isAuthenticated) {
    const res = NextResponse.redirect(
      new URL(buildSigninUrl(pathname + search), req.url),
    );
    if (token) res.cookies.delete(ACCESS_TOKEN_COOKIE);
    return finish(res);
  }

  if (matchesPath(pathname, GUEST_ONLY_PATHS) && isAuthenticated) {
    const target = getSafeRedirect(req.nextUrl.searchParams.get("redirect"));
    return finish(NextResponse.redirect(new URL(target ?? "/", req.url)));
  }

  return finish(NextResponse.next({ request: req }));
}

export const config = {
  // Every page, so the header's session also renews; skip Next.js internals, API routes and static files.
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};
