"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getCartAction } from "@/lib/cart/actions";
import { getWishlistAction } from "@/lib/wishlist/actions";
import { setCart } from "@/redux/features/cart-slice";
import { toCartItems } from "@/redux/features/cart-thunks";
import { setWishlist } from "@/redux/features/wishlist-slice";
import { toWishlistItems } from "@/redux/features/wishlist-thunks";
import type { AppDispatch } from "@/redux/store";

/**
 * Loads the signed-in user's cart and wishlist once when the app first mounts,
 * so a full page load starts from the server state. Later sign-ins and
 * sign-outs are handled by CartHydrator through route refreshes. Guests get
 * UNAUTHENTICATED and keep their local state.
 */
export default function InitialSync() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCartAction(), getWishlistAction()])
      .then(([cart, wishlist]) => {
        if (cancelled) return;
        if (cart.ok === true) {
          dispatch(setCart({ items: toCartItems(cart.cart), authenticated: true }));
        }
        if (wishlist.ok === true) {
          dispatch(
            setWishlist({
              items: toWishlistItems(wishlist.wishlist),
              authenticated: true,
            }),
          );
        }
      })
      .catch(() => {
        // Offline or API down: keep the local state.
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
