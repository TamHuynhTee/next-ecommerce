import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "./constants";
import { getTokenExp } from "./token";

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Writes both session cookies on a response. */
export function setSessionCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  const exp = getTokenExp(accessToken);
  res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...base,
    ...(exp ? { expires: new Date(exp * 1000) } : {}),
  });
  res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...base,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearSessionCookies(res: NextResponse) {
  res.cookies.delete(ACCESS_TOKEN_COOKIE);
  res.cookies.delete(REFRESH_TOKEN_COOKIE);
}
