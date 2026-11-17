"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api-client";
import { errorMessage } from "@/lib/api/errors";
import type { ActionState } from "@/lib/api/types";

type VariantInput = {
  id?: string;
  sku: string;
  name: string;
  color: string;
  size: string;
  unitPrice: string;
  originalPrice: string;
  currency: string;
  stock: string;
  imageUrl: string;
  isActive: boolean;
};

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const orNull = (value: string) => value.trim() || null;

export async function saveProductAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = text(fd, "id");
  let variants: VariantInput[];
  try {
    variants = JSON.parse(text(fd, "variants") || "[]");
  } catch {
    return { error: "Invalid variants data." };
  }
  if (variants.length === 0) return { error: "Add at least one variant." };

  const body = {
    name: text(fd, "name"),
    slug: text(fd, "slug"),
    description: orNull(text(fd, "description")),
    status: text(fd, "status") || "draft",
    thumbnailUrl: orNull(text(fd, "thumbnailUrl")),
    categoryId: text(fd, "categoryId"),
    variants: variants.map((v) => ({
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
  if (!body.categoryId) return { error: "Select a sub-category." };

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

export async function deleteProductAction(id: string): Promise<ActionState> {
  try {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/products");
  return { ok: true };
}
