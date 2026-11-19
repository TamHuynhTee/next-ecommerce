"use server";

import { wishlistRequest } from "./api";
import type { WishlistActionResult } from "./types";

export async function getWishlistAction(): Promise<WishlistActionResult> {
  return wishlistRequest("GET", "");
}

export async function addWishlistItemAction(
  variantId: string,
): Promise<WishlistActionResult> {
  return wishlistRequest("POST", "/items", { variantId });
}

export async function removeWishlistItemAction(
  variantId: string,
): Promise<WishlistActionResult> {
  return wishlistRequest("DELETE", `/items/${encodeURIComponent(variantId)}`);
}

export async function clearWishlistAction(): Promise<WishlistActionResult> {
  return wishlistRequest("DELETE", "");
}

/** Folds the guest wishlist into the user's wishlist right after sign-in. */
export async function mergeWishlistAction(
  variantIds: string[],
): Promise<WishlistActionResult> {
  return wishlistRequest("POST", "/merge", { variantIds });
}
