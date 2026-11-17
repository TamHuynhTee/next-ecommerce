"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api-client";
import { errorMessage } from "@/lib/api/errors";
import { getCategories } from "@/lib/api/catalog";
import type { ActionState, Category } from "@/lib/api/types";

import type { ProductFormValues } from "./form-types";

const orNull = (value: string) => value.trim() || null;

/** Creates (no id) or updates a product. Redirects to the list on success. */
export async function saveProductAction(id: string | undefined, values: ProductFormValues): Promise<ActionState> {
  if (values.variants.length === 0) return { error: "Add at least one variant." };
  if (!values.categoryId) return { error: "Select a sub-category." };

  const body = {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: orNull(values.description),
    status: values.status || "draft",
    thumbnailUrl: orNull(values.thumbnailUrl),
    categoryId: values.categoryId,
    variants: values.variants.map((v) => ({
      ...(v.id ? { id: v.id } : {}),
      sku: v.sku.trim(),
      name: orNull(v.name),
      color: orNull(v.color),
      size: orNull(v.size),
      unitPrice: v.unitPrice.trim(),
      originalPrice: orNull(v.originalPrice),
      currency: v.currency.trim().toUpperCase(),
      stock: Number(v.stock || 0),
      imageUrl: orNull(v.imageUrl),
      isActive: v.isActive,
    })),
  };

  try {
    await apiFetch(id ? `/products/${id}` : "/products", {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/products");
  redirect("/products");
}

/** Loads the category tree on demand (when the sub-category select is opened). */
export async function loadCategoriesAction(): Promise<{ categories?: Category[]; error?: string }> {
  try {
    return { categories: await getCategories() };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function deleteProductAction(id: string): Promise<ActionState> {
  try {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/products");
  return { ok: true };
}
