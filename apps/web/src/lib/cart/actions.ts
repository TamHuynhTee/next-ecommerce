"use server";

import { cartRequest } from "./api";
import type { CartActionResult } from "./types";

type Line = { variantId: string; quantity: number };

export async function getCartAction(): Promise<CartActionResult> {
  return cartRequest("GET", "");
}

export async function addCartItemAction(line: Line): Promise<CartActionResult> {
  return cartRequest("POST", "/items", line);
}

export async function updateCartItemAction(
  variantId: string,
  quantity: number,
): Promise<CartActionResult> {
  return cartRequest("PATCH", `/items/${encodeURIComponent(variantId)}`, {
    quantity,
  });
}

export async function removeCartItemAction(
  variantId: string,
): Promise<CartActionResult> {
  return cartRequest("DELETE", `/items/${encodeURIComponent(variantId)}`);
}

export async function clearCartAction(): Promise<CartActionResult> {
  return cartRequest("DELETE", "");
}

/** Folds the guest cart into the user's cart right after sign-in. */
export async function mergeCartAction(
  items: Line[],
): Promise<CartActionResult> {
  return cartRequest("POST", "/merge", { items });
}
