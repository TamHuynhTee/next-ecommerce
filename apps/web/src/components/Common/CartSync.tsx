"use client";

import { useEffect } from "react";
import { useDispatch, useStore } from "react-redux";

import { mergeCartAction } from "@/lib/cart/actions";
import type { ServerCart } from "@/lib/cart/types";
import { setCart } from "@/redux/features/cart-slice";
import { toCartItems } from "@/redux/features/cart-thunks";
import type { AppDispatch, RootState } from "@/redux/store";

/**
 * Mirrors the server cart into Redux. `cart` is null for guests. When a guest
 * signs in, whatever they collected is merged into their account cart first.
 */
export default function CartSync({ cart }: { cart: ServerCart | null }) {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();

  useEffect(() => {
    let cancelled = false;
    const { items, authenticated } = store.getState().cartReducer;

    if (!cart) {
      // Signed out: drop the account cart, leave a guest cart alone.
      if (authenticated) dispatch(setCart({ items: [], authenticated: false }));
      return;
    }

    if (!authenticated && items.length > 0) {
      mergeCartAction(items.map((i) => ({ variantId: i.id, quantity: i.quantity })))
        .then((result) => {
          if (cancelled) return;
          const merged = result.ok ? result.cart : cart;
          dispatch(setCart({ items: toCartItems(merged), authenticated: true }));
        })
        .catch(() => {
          if (!cancelled) {
            dispatch(setCart({ items: toCartItems(cart), authenticated: true }));
          }
        });
    } else {
      dispatch(setCart({ items: toCartItems(cart), authenticated: true }));
    }

    return () => {
      cancelled = true;
    };
  }, [cart, dispatch, store]);

  return null;
}
