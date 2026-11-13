import { forwardAuth } from "@/lib/auth/proxyAuth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  return forwardAuth("/auth/sign-in", { email, password });
}
