"use server";

import { revalidatePath } from "next/cache";

import { apiFetch } from "@/lib/api-client";
import { errorMessage } from "@/lib/api/errors";
import type { ActionState } from "@/lib/api/types";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

async function run(fn: () => Promise<unknown>): Promise<ActionState> {
  try {
    await fn();
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/categories");
  revalidatePath("/products");
  return { ok: true };
}

/** Create or update a category (`kind=category`) or a sub-category (`kind=sub`); `id` present means update. */
export async function saveCategoryAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const kind = text(fd, "kind");
  const id = text(fd, "id");
  const parentId = text(fd, "parentId");
  const body: Record<string, unknown> = {
    name: text(fd, "name"),
    slug: text(fd, "slug"),
    description: text(fd, "description") || null,
  };
  if (kind === "category") body.status = text(fd, "status") || "active";

  const path =
    kind === "sub"
      ? id
        ? `/sub-categories/${id}`
        : `/categories/${parentId}/sub-categories`
      : id
        ? `/categories/${id}`
        : "/categories";
  return run(() => apiFetch(path, { method: id ? "PATCH" : "POST", body: JSON.stringify(body) }));
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  return run(() => apiFetch(`/categories/${id}`, { method: "DELETE" }));
}

export async function deleteSubCategoryAction(id: string): Promise<ActionState> {
  return run(() => apiFetch(`/sub-categories/${id}`, { method: "DELETE" }));
}
