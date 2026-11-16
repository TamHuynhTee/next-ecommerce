"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE, API_URL, SIGN_IN_PATH } from "@/lib/auth/constants";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { decodeToken, userFromToken } from "@/lib/auth/token";

export type SignInState = { error?: string; email?: string };

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  let token: string | undefined;
  try {
    const res = await fetch(`${API_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 400) return { error: "Invalid email or password.", email };
    if (!res.ok) return { error: "Sign-in failed. Please try again later.", email };
    token = ((await res.json()) as { access_token?: string }).access_token;
  } catch {
    return { error: "Cannot reach the API server.", email };
  }

  // Customers can authenticate against the API but must not enter the backoffice.
  if (!token || !userFromToken(token)) return { error: "This account does not have admin access.", email };

  const exp = decodeToken(token)?.exp;
  (await cookies()).set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(exp ? { expires: new Date(exp * 1000) } : {}),
  });

  redirect(getSafeRedirect(String(formData.get("redirect") ?? "")) ?? "/");
}

export async function signOutAction() {
  (await cookies()).delete(ACCESS_TOKEN_COOKIE);
  redirect(SIGN_IN_PATH);
}
