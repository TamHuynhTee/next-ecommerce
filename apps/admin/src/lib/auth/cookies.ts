import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_MAX_AGE } from "./constants";
import { decodeToken } from "./token";

type CookieJar = { set(name: string, value: string, options: Record<string, unknown>): unknown };

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Writes both session cookies. Works with `cookies()` and `NextResponse.cookies`. */
export function setSessionCookies(jar: CookieJar, accessToken: string, refreshToken: string) {
  const exp = decodeToken(accessToken)?.exp;
  jar.set(ACCESS_TOKEN_COOKIE, accessToken, { ...base, ...(exp ? { expires: new Date(exp * 1000) } : {}) });
  jar.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...base, maxAge: REFRESH_TOKEN_MAX_AGE });
}
