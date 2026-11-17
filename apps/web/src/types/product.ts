export type ProductVariant = {
  id: string;
  sku: string;
  name: string | null;
  color: string | null;
  size: string | null;
  /** Selling price in whole VND. */
  price: number;
  /** Price before discount in whole VND; equal to `price` when not discounted. */
  originalPrice: number;
  stock: number;
  image: string | null;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  /** Price before discount of the default (cheapest) variant. */
  price: number;
  /** Selling price of the default (cheapest) variant. */
  discountedPrice: number;
  /** Id of the default variant, used as the cart line id. */
  variantId?: string;
  categoryId?: string;
  description?: string | null;
  categoryName?: string;
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
  variants?: ProductVariant[];
};
