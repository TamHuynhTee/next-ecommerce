import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ACCESS_TOKEN_COOKIE);
  return res;
}
