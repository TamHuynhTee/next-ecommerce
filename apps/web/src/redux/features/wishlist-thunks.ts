import toast from "react-hot-toast";

import {
  addWishlistItemAction,
  clearWishlistAction,
  removeWishlistItemAction,
} from "@/lib/wishlist/actions";
import type {
  ServerWishlist,
  WishlistActionError,
  WishlistActionResult,
} from "@/lib/wishlist/types";
import type { AppDispatch, RootState } from "../store";
import {
  addItemLocal,
  clearLocal,
  removeItemLocal,
  setWishlist,
  WishListItem,
} from "./wishlist-slice";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

type Thunk = (dispatch: AppDispatch, getState: () => RootState) => Promise<void>;

/** Converts the API wishlist into the shape the UI components already use. */
export function toWishlistItems(wishlist: ServerWishlist): WishListItem[] {
  return wishlist.items.map((line) => {
    const image = line.imageUrl ?? PLACEHOLDER_IMAGE;
    return {
      id: line.variantId,
      title: line.title,
      price: line.price,
      discountedPrice: line.discountedPrice,
      quantity: 1,
      status: line.stock > 0 ? "available" : "out of stock",
      stock: line.stock,
      slug: line.slug,
      imgs: { thumbnails: [image], previews: [image] },
    };
  });
}

const MESSAGES: Record<WishlistActionError, string> = {
  UNAUTHENTICATED: "Your session has expired. Please sign in again.",
  VARIANT_NOT_AVAILABLE: "This product is no longer available.",
  UNAVAILABLE: "Could not update your wishlist. Please try again.",
};

/** Runs a server call for a signed-in user and mirrors the result into Redux. */
async function sync(
  dispatch: AppDispatch,
  getState: () => RootState,
  run: () => Promise<WishlistActionResult>,
): Promise<void> {
  const result = await run();
  if (result.ok === true) {
    dispatch(
      setWishlist({
        items: toWishlistItems(result.wishlist),
        authenticated: true,
      }),
    );
    return;
  }
  const { error } = result as { ok: false; error: WishlistActionError };
  if (error === "UNAUTHENTICATED") {
    // Session ended: keep what is on screen as a guest wishlist.
    dispatch(
      setWishlist({
        items: getState().wishlistReducer.items,
        authenticated: false,
      }),
    );
  }
  toast.error(MESSAGES[error]);
}

const isSignedIn = (getState: () => RootState) =>
  getState().wishlistReducer.authenticated;

export const addItemToWishlist =
  (item: WishListItem): Thunk =>
  async (dispatch, getState) => {
    if (!isSignedIn(getState)) {
      dispatch(addItemLocal(item));
      return;
    }
    await sync(dispatch, getState, () => addWishlistItemAction(item.id));
  };

export const removeItemFromWishlist =
  (id: string): Thunk =>
  async (dispatch, getState) => {
    if (!isSignedIn(getState)) {
      dispatch(removeItemLocal(id));
      return;
    }
    await sync(dispatch, getState, () => removeWishlistItemAction(id));
  };

export const removeAllItemsFromWishlist =
  (): Thunk => async (dispatch, getState) => {
    if (!isSignedIn(getState)) {
      dispatch(clearLocal());
      return;
    }
    await sync(dispatch, getState, () => clearWishlistAction());
  };
