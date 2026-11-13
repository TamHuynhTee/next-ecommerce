import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  GUEST_ONLY_PATHS,
  PROTECTED_PATHS,
} from "@/lib/auth/constants";
import { buildSigninUrl, getSafeRedirect } from "@/lib/auth/redirect";
import { isTokenExpired } from "@/lib/auth/token";

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isAuthenticated = !!token && !isTokenExpired(token);

  if (matchesPath(pathname, PROTECTED_PATHS) && !isAuthenticated) {
    const res = NextResponse.redirect(
      new URL(buildSigninUrl(pathname + search), req.url),
    );
    if (token) res.cookies.delete(ACCESS_TOKEN_COOKIE);
    return res;
  }

  if (matchesPath(pathname, GUEST_ONLY_PATHS) && isAuthenticated) {
    const target = getSafeRedirect(req.nextUrl.searchParams.get("redirect"));
    return NextResponse.redirect(new URL(target ?? "/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/my-account/:path*", "/checkout/:path*", "/signin", "/signup"],
};
