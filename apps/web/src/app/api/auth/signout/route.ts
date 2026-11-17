import { NextRequest, NextResponse } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { clearSessionCookies } from "@/lib/auth/cookie";
import { revokeRefreshToken } from "@/lib/auth/refresh";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) await revokeRefreshToken(refreshToken);

  const res = NextResponse.json({ success: true });
  clearSessionCookies(res);
  return res;
}
