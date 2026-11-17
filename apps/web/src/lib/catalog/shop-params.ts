import type { Category } from "@/types/category";
import type { ProductQuery, ProductSort } from "./types";

export const SHOP_PAGE_SIZE = 12;

export type RawSearchParams = Record<string, string | string[] | undefined>;
/** Flat, serializable version of the search params, safe to pass to client components. */
export type ShopParams = Record<string, string>;

const SORTS: ProductSort[] = ["newest", "price_asc", "price_desc"];

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const toInt = (value: string | undefined) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function flattenParams(raw: RawSearchParams): ShopParams {
  const out: ShopParams = {};
  for (const [key, value] of Object.entries(raw)) {
    const v = first(value);
    if (v) out[key] = v;
  }
  return out;
}

/** Turns URL params (page, sort, category, sub, minPrice, maxPrice) into an API query. */
export function toProductQuery(params: ShopParams, categories: Category[]) {
  const sort = SORTS.includes(params.sort as ProductSort)
    ? (params.sort as ProductSort)
    : "newest";
  const page = Math.max(1, toInt(params.page) ?? 1);

  const query: ProductQuery = {
    page,
    limit: SHOP_PAGE_SIZE,
    sort,
    minPrice: toInt(params.minPrice),
    maxPrice: toInt(params.maxPrice),
    search: params.q,
  };

  const category = categories.find((c) => c.slug === params.category);
  const sub = categories
    .flatMap((c) => c.subCategories)
    .find((s) => s.slug === params.sub);
  if (sub) query.categoryId = sub.id;
  else if (category) query.parentCategoryId = category.id;

  return { query, page, sort };
}

/** Builds a shop URL from the current params with some of them replaced (or removed with null). */
export function buildShopHref(
  basePath: string,
  params: ShopParams,
  overrides: Record<string, string | number | null>,
) {
  const next: ShopParams = { ...params };
  // Any filter change goes back to the first page unless a page is given explicitly.
  if (!("page" in overrides)) delete next.page;
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === "") delete next[key];
    else next[key] = String(value);
  }
  const qs = new URLSearchParams(next).toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
