// Cookies are shared across ports on localhost, so this name must differ from the storefront's cookie.
export const ACCESS_TOKEN_COOKIE = "admin_access_token";
export const SIGN_IN_PATH = "/sign-in";
export const API_URL = process.env.API_URL ?? "http://localhost:8100";
export const REFRESH_TOKEN_COOKIE = "admin_refresh_token";
// Matches the API default refresh lifetime; the API enforces the real expiry.
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
// Refresh a little before the access token actually expires to avoid racing the API.
export const REFRESH_LEEWAY_SECONDS = 30;
