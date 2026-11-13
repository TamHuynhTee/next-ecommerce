import { forwardAuth } from "@/lib/auth/proxyAuth";

export async function POST(req: Request) {
  const { username, firstName, lastName, email, password } = await req.json();
  // The API returns an access token on registration, so the user is signed in right away.
  return forwardAuth("/auth/sign-up", { username, firstName, lastName, email, password });
}
