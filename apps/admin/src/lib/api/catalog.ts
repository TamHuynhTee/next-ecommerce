import "server-only";

import { apiFetch } from "@/lib/api-client";
import type { Category, Paginated, Product, ProductStatus } from "./types";

export const getCategories = () => apiFetch<Category[]>("/categories");

export type ProductQuery = { page?: number; limit?: number; search?: string; status?: ProductStatus | ""; categoryId?: string };

export function getProducts(query: ProductQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, String(value));
  return apiFetch<Paginated<Product>>(`/products?${params}`);
}

export const getProduct = (id: string) => apiFetch<Product>(`/products/${id}`);
