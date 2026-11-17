import { getProducts } from "@/lib/catalog/api";
import type { Product } from "@/types/product";
import RecentlyViewdItems from "./RecentlyViewd";

/** Other products from the same sub-category, falling back to the newest ones. */
const RelatedProducts = async ({ product }: { product: Product }) => {
  const sameCategory = product.categoryId
    ? await getProducts({ categoryId: product.categoryId, limit: 9 })
    : null;
  let items = (sameCategory?.items ?? []).filter((p) => p.id !== product.id);
  if (items.length === 0) {
    items = (await getProducts({ limit: 9 })).items.filter(
      (p) => p.id !== product.id
    );
  }
  if (items.length === 0) return null;
  return <RecentlyViewdItems products={items.slice(0, 8)} />;
};

export default RelatedProducts;
