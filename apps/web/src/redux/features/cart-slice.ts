import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type CartItem = {
  /** Variant id: cart lines are per variant. */
  id: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  /** Known for lines loaded from the server; used to cap the quantity. */
  stock?: number;
  slug?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type InitialState = {
  items: CartItem[];
  /** True while the cart mirrors the signed-in user's server cart. */
  authenticated: boolean;
};

const initialState: InitialState = {
  items: [],
  authenticated: false,
};

/**
 * Plain reducers only touch local state. Components dispatch the thunks in
 * `cart-thunks.ts`, which also sync with the API for signed-in users.
 */
export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (
      state,
      action: PayloadAction<{ items: CartItem[]; authenticated: boolean }>,
    ) => {
      state.items = action.payload.items;
      state.authenticated = action.payload.authenticated;
    },
    addItemLocal: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs, slug } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          discountedPrice,
          imgs,
          slug,
        });
      }
    },
    removeItemLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantityLocal: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) existingItem.quantity = action.payload.quantity;
    },
    clearLocal: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  setCart,
  addItemLocal,
  removeItemLocal,
  updateQuantityLocal,
  clearLocal,
} = cart.actions;
export default cart.reducer;
