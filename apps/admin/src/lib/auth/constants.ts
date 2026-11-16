// Cookies are shared across ports on localhost, so this name must differ from the storefront's cookie.
export const ACCESS_TOKEN_COOKIE = "admin_access_token";
export const SIGN_IN_PATH = "/sign-in";
export const API_URL = process.env.API_URL ?? "http://localhost:8100";
