import toast from "react-hot-toast";

import {
  addCartItemAction,
  clearCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/lib/cart/actions";
import type {
  CartActionError,
  CartActionResult,
  ServerCart,
} from "@/lib/cart/types";
import type { AppDispatch, RootState } from "../store";
import {
  addItemLocal,
  CartItem,
  clearLocal,
  removeItemLocal,
  setCart,
  updateQuantityLocal,
} from "./cart-slice";

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

type Thunk = (dispatch: AppDispatch, getState: () => RootState) => Promise<void>;

/** Converts the API cart into the shape the UI components already use. */
export function toCartItems(cart: ServerCart): CartItem[] {
  return cart.items.map((line) => {
    const image = line.imageUrl ?? PLACEHOLDER_IMAGE;
    return {
      id: line.variantId,
      title: line.title,
      price: line.price,
      discountedPrice: line.discountedPrice,
      quantity: line.quantity,
      stock: line.stock,
      slug: line.slug,
      imgs: { thumbnails: [image], previews: [image] },
    };
  });
}

const MESSAGES: Record<CartActionError, string> = {
  UNAUTHENTICATED: "Your session has expired. Please sign in again.",
  OUT_OF_STOCK: "This product is out of stock.",
  VARIANT_NOT_AVAILABLE: "This product is no longer available.",
  CART_ITEM_NOT_FOUND: "This item is no longer in your cart.",
  UNAVAILABLE: "Could not update your cart. Please try again.",
};

/** Runs a server call for a signed-in user and mirrors the result into Redux. */
async function sync(
  dispatch: AppDispatch,
  getState: () => RootState,
  run: () => Promise<CartActionResult>,
): Promise<void> {
  const result = await run();
  if (result.ok === true) {
    dispatch(setCart({ items: toCartItems(result.cart), authenticated: true }));
    return;
  }
  const { error } = result as { ok: false; error: CartActionError };
  if (error === "UNAUTHENTICATED") {
    // Session ended: keep what is on screen as a guest cart.
    dispatch(
      setCart({ items: getState().cartReducer.items, authenticated: false }),
    );
  }
  toast.error(MESSAGES[error]);
}

const isSignedIn = (getState: () => RootState) =>
  getState().cartReducer.authenticated;

export const addItemToCart =
  (item: CartItem): Thunk =>
  async (dispatch, getState) => {
    if (!isSignedIn(getState)) {
      dispatch(addItemLocal(item));
      return;
    }
    await sync(dispatch, getState, () =>
      addCartItemAction({ variantId: item.id, quantity: item.quantity }),
    );
  };

export const removeItemFromCart =
  (id: string): Thunk =>
  async (dispatch, getState) => {
    if (!isSignedIn(getState)) {
      dispatch(removeItemLocal(id));
      return;
    }
    await sync(dispatch, getState, () => removeCartItemAction(id));
  };

export const updateCartItemQuantity =
  (payload: { id: string; quantity: number }): Thunk =>
  async (dispatch, getState) => {
    if (!isSignedIn(getState)) {
      dispatch(updateQuantityLocal(payload));
      return;
    }
    await sync(dispatch, getState, () =>
      updateCartItemAction(payload.id, payload.quantity),
    );
  };

export const removeAllItemsFromCart =
  (): Thunk => async (dispatch, getState) => {
    if (!isSignedIn(getState)) {
      dispatch(clearLocal());
      return;
    }
    await sync(dispatch, getState, () => clearCartAction());
  };
