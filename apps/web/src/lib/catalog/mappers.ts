import type { Category } from "@/types/category";
import type { Product, ProductVariant } from "@/types/product";
import type { ApiCategory, ApiProduct, ApiVariant } from "./types";

export const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

const toVariant = (v: ApiVariant): ProductVariant => {
  const price = Number(v.unitPrice);
  return {
    id: v.id,
    sku: v.sku,
    name: v.name,
    color: v.color,
    size: v.size,
    price,
    originalPrice: v.originalPrice ? Number(v.originalPrice) : price,
    stock: v.stock,
    image: v.imageUrl,
  };
};

/** Maps an API product to the shape the storefront components render. */
export function toProduct(p: ApiProduct): Product {
  const variants = p.variants
    .filter((v) => v.isActive)
    .map(toVariant)
    .sort((a, b) => a.price - b.price);
  const base = variants[0];

  const images = Array.from(
    new Set(
      [p.thumbnailUrl, ...variants.map((v) => v.image)].filter(
        (src): src is string => !!src,
      ),
    ),
  );
  const gallery = images.length ? images : [PLACEHOLDER_IMAGE];

  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    price: base ? Math.max(base.originalPrice, base.price) : 0,
    discountedPrice: base?.price ?? 0,
    variantId: base?.id,
    categoryId: p.categoryId,
    description: p.description,
    categoryName: p.category?.name,
    imgs: { thumbnails: gallery, previews: gallery },
    variants,
  };
}

export function toCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    title: c.name,
    subCategories: c.subCategories.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.name,
    })),
  };
}
