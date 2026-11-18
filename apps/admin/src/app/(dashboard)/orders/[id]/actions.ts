"use server";

import { revalidatePath } from "next/cache";

import { apiFetch } from "@/lib/api-client";
import { errorMessage } from "@/lib/api/errors";
import type { OrderStatus } from "@/lib/api/orders";
import type { ActionState } from "@/lib/api/types";

/** Moves an order to its next status; the API enforces which steps are valid. */
export async function updateOrderStatusAction(id: string, status: OrderStatus): Promise<ActionState> {
  try {
    await apiFetch(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  revalidatePath("/");
  return { ok: true };
}
