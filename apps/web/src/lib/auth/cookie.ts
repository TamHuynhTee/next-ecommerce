import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "./constants";

export function setAccessTokenCookie(res: NextResponse, token: string) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
