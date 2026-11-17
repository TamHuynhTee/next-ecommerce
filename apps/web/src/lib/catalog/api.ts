import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { API_URL } from "@/lib/auth/constants";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { toCategory, toProduct } from "./mappers";
import type {
  ApiCategory,
  ApiProduct,
  Paginated,
  ProductQuery,
} from "./types";

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Catalog request failed: ${res.status} ${path}`);
  return (await res.json()) as T;
}

// The catalog is public, so it is cached for everyone and refreshed every few minutes.

export async function getProducts(
  query: ProductQuery = {},
): Promise<Paginated<Product>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const data = await get<Paginated<ApiProduct>>(`/products?${params}`);
  const page = data ?? { items: [], total: 0, page: 1, limit: query.limit ?? 20 };
  return { ...page, items: page.items.map(toProduct) };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `product:${slug}`);

  const data = await get<ApiProduct>(`/products/slug/${encodeURIComponent(slug)}`);
  return data ? toProduct(data) : null;
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories");

  const data = (await get<ApiCategory[]>("/categories")) ?? [];
  return data.filter((c) => c.status === "active").map(toCategory);
}
