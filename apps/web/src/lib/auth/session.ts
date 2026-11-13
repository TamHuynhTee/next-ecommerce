import "server-only";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "./constants";
import { isTokenExpired } from "./token";

export type Session = { token: string } | null;

/**
 * Reads the access token from the cookie. Reads request data, so callers must
 * sit behind a <Suspense> boundary or inside a `use cache: private` scope.
 */
export async function getSession(): Promise<Session> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token || isTokenExpired(token)) return null;
  return { token };
}
