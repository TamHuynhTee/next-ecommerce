import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WishListItem = {
  /** Variant id: wishlist entries are per variant. */
  id: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity?: number;
  status?: string;
  /** Known for entries loaded from the server. */
  stock?: number;
  slug?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: WishListItem[];
  /** True while the wishlist mirrors the signed-in user's server wishlist. */
  authenticated: boolean;
};

const initialState: InitialState = {
  items: [],
  authenticated: false,
};

/**
 * Plain reducers only touch local state. Components dispatch the thunks in
 * `wishlist-thunks.ts`, which also sync with the API for signed-in users.
 */
export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (
      state,
      action: PayloadAction<{ items: WishListItem[]; authenticated: boolean }>,
    ) => {
      state.items = action.payload.items;
      state.authenticated = action.payload.authenticated;
    },
    addItemLocal: (state, action: PayloadAction<WishListItem>) => {
      // A wishlist holds each product once.
      if (state.items.some((item) => item.id === action.payload.id)) return;
      state.items.push({ ...action.payload, quantity: 1 });
    },
    removeItemLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearLocal: (state) => {
      state.items = [];
    },
  },
});

export const { setWishlist, addItemLocal, removeItemLocal, clearLocal } =
  wishlist.actions;
export default wishlist.reducer;
