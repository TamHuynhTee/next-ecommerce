export const ACCESS_TOKEN_COOKIE = "access_token";
export const SIGNIN_PATH = "/signin";

// Pages that require an authenticated user.
export const PROTECTED_PATHS = ["/my-account", "/checkout"];

// Pages that only make sense for guests.
export const GUEST_ONLY_PATHS = ["/signin", "/signup"];

export const API_URL = process.env.API_URL ?? "http://localhost:8100";

export const REFRESH_TOKEN_COOKIE = "refresh_token";
// Matches the API default refresh lifetime; the API enforces the real expiry.
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
// Refresh a little before the access token actually expires to avoid racing the API.
export const REFRESH_LEEWAY_SECONDS = 30;
