import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE, SIGN_IN_PATH } from "./constants";
import { userFromToken, type AdminUser } from "./token";

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getSession(): Promise<AdminUser | null> {
  return userFromToken(await getAccessToken());
}

/** Auth guard for server components/layouts. Redirects to sign-in when there is no valid admin session. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getSession();
  if (!user) redirect(SIGN_IN_PATH);
  return user;
}
