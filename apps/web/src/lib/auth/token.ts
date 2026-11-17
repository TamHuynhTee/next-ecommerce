/** Decodes the JWT expiry (seconds since epoch) without verifying the signature. */
export function getTokenExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

/**
 * Cheap pre-check on the JWT expiry; the API remains the source of truth.
 * Malformed tokens count as expired.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return true;
  }
  const exp = getTokenExp(token);
  return exp !== null && exp * 1000 <= Date.now();
}
