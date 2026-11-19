/** Wishlist line as returned by the API (prices are whole VND). */
export type WishlistLine = {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  discountedPrice: number;
  stock: number;
  imageUrl: string | null;
};

export type ServerWishlist = { items: WishlistLine[] };

export type WishlistActionError =
  | "UNAUTHENTICATED"
  | "VARIANT_NOT_AVAILABLE"
  | "UNAVAILABLE";

export type WishlistActionResult =
  | { ok: true; wishlist: ServerWishlist }
  | { ok: false; error: WishlistActionError };
