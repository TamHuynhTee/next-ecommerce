// Placeholder HTTP client. The NestJS API runs on port 8100.
// Real auth (JWT) will be attached here once admin login is implemented.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json() as Promise<T>;
}
