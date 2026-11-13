export const ACCESS_TOKEN_COOKIE = "access_token";
export const SIGNIN_PATH = "/signin";

// Pages that require an authenticated user.
export const PROTECTED_PATHS = ["/my-account", "/checkout"];

// Pages that only make sense for guests.
export const GUEST_ONLY_PATHS = ["/signin", "/signup"];

export const API_URL = process.env.API_URL ?? "http://localhost:8100";
