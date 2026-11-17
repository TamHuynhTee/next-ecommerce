import { unstable_rethrow } from "next/navigation";

import { ApiError } from "@/lib/api-client";

const MESSAGES: Record<string, string> = {
  SLUG_EXISTED: "This slug is already used.",
  SKU_EXISTED: "One of the SKUs is already used.",
  CATEGORY_HAS_CHILDREN: "Delete or move this category's sub-categories first.",
  SUB_CATEGORY_HAS_PRODUCTS: "This sub-category still has products.",
  CATEGORY_NOT_FOUND: "Category not found.",
  SUB_CATEGORY_NOT_FOUND: "Sub-category not found.",
  PRODUCT_NOT_FOUND: "Product not found.",
  RESOURCE_IN_USE: "This item is still in use.",
};

/** Convert any thrown error into a user-facing message. */
export function errorMessage(error: unknown): string {
  // Let Next.js control-flow errors (e.g. redirect to /sign-in) propagate.
  unstable_rethrow(error);
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return "You are not allowed to do this. Sign in again.";
    return MESSAGES[error.code] ?? error.code;
  }
  return "Cannot reach the API server.";
}
