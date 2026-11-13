/**
 * Decodes the JWT expiry without verifying the signature.
 * The API remains the source of truth; this is only a cheap pre-check.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (typeof json.exp !== "number") return false;
    return json.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
