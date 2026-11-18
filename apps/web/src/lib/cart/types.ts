/** Cart line as returned by the API (prices are whole VND). */
export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  stock: number;
  imageUrl: string | null;
};

export type ServerCart = { items: CartLine[]; subtotal: number };

export type CartActionError =
  | "UNAUTHENTICATED"
  | "OUT_OF_STOCK"
  | "VARIANT_NOT_AVAILABLE"
  | "CART_ITEM_NOT_FOUND"
  | "UNAVAILABLE";

export type CartActionResult =
  | { ok: true; cart: ServerCart }
  | { ok: false; error: CartActionError };
