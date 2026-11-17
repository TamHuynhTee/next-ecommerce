"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE, API_URL, REFRESH_TOKEN_COOKIE, SIGN_IN_PATH } from "@/lib/auth/constants";
import { setSessionCookies } from "@/lib/auth/cookies";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { revokeRefreshToken } from "@/lib/auth/refresh";
import { userFromToken } from "@/lib/auth/token";

export type SignInState = { error?: string; email?: string };

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  let token: string | undefined;
  let refreshToken: string | undefined;
  try {
    const res = await fetch(`${API_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 400) return { error: "Invalid email or password.", email };
    if (!res.ok) return { error: "Sign-in failed. Please try again later.", email };
    const body = (await res.json()) as { access_token?: string; refresh_token?: string };
    token = body.access_token;
    refreshToken = body.refresh_token;
  } catch {
    return { error: "Cannot reach the API server.", email };
  }

  // Customers can authenticate against the API but must not enter the backoffice.
  if (!token || !refreshToken || !userFromToken(token)) {
    if (refreshToken) await revokeRefreshToken(refreshToken);
    return { error: "This account does not have admin access.", email };
  }

  setSessionCookies(await cookies(), token, refreshToken);

  redirect(getSafeRedirect(String(formData.get("redirect") ?? "")) ?? "/");
}

export async function signOutAction() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) await revokeRefreshToken(refreshToken);
  jar.delete(ACCESS_TOKEN_COOKIE);
  jar.delete(REFRESH_TOKEN_COOKIE);
  redirect(SIGN_IN_PATH);
}
