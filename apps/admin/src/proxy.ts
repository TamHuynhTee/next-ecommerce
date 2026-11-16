import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, SIGN_IN_PATH } from "@/lib/auth/constants";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { userFromToken } from "@/lib/auth/token";

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isAdmin = !!userFromToken(token);
  const isSignIn = pathname === SIGN_IN_PATH;

  if (!isAdmin && !isSignIn) {
    const url = new URL(SIGN_IN_PATH, req.url);
    if (pathname !== "/") url.searchParams.set("redirect", pathname + search);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(ACCESS_TOKEN_COOKIE);
    return res;
  }

  if (isAdmin && isSignIn) {
    const target = getSafeRedirect(req.nextUrl.searchParams.get("redirect"));
    return NextResponse.redirect(new URL(target ?? "/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next.js internals and static files.
  matcher: ["/((?!_next/|favicon.ico|.*\\..*).*)"],
};
