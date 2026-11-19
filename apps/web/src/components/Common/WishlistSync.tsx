"use client";

import { useEffect } from "react";
import { useDispatch, useStore } from "react-redux";

import type { ServerWishlist } from "@/lib/wishlist/types";
import { mergeWishlistAction } from "@/lib/wishlist/actions";
import { setWishlist } from "@/redux/features/wishlist-slice";
import { toWishlistItems } from "@/redux/features/wishlist-thunks";
import type { AppDispatch, RootState } from "@/redux/store";

/**
 * Mirrors the server wishlist into Redux. `wishlist` is null for guests. When a
 * guest signs in, whatever they saved is merged into their account first.
 */
export default function WishlistSync({
  wishlist,
}: {
  wishlist: ServerWishlist | null;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();

  useEffect(() => {
    let cancelled = false;
    const { items, authenticated } = store.getState().wishlistReducer;

    if (!wishlist) {
      // Signed out: drop the account wishlist, leave a guest wishlist alone.
      if (authenticated) {
        dispatch(setWishlist({ items: [], authenticated: false }));
      }
      return;
    }

    const apply = (value: ServerWishlist) =>
      dispatch(
        setWishlist({ items: toWishlistItems(value), authenticated: true }),
      );

    if (!authenticated && items.length > 0) {
      mergeWishlistAction(items.map((i) => i.id))
        .then((result) => {
          if (!cancelled) apply(result.ok === true ? result.wishlist : wishlist);
        })
        .catch(() => {
          if (!cancelled) apply(wishlist);
        });
    } else {
      apply(wishlist);
    }

    return () => {
      cancelled = true;
    };
  }, [wishlist, dispatch, store]);

  return null;
}
