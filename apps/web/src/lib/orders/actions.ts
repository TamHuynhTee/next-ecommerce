"use server";

import { orderRequest } from "./api";
import type {
  CreateOrderInput,
  Order,
  OrderPage,
  OrderResult,
} from "./types";

export async function createOrderAction(
  input: CreateOrderInput,
): Promise<OrderResult<Order>> {
  return orderRequest<Order>("POST", "", input);
}

export async function listOrdersAction(
  page = 1,
): Promise<OrderResult<OrderPage>> {
  return orderRequest<OrderPage>("GET", `?page=${page}&limit=10`);
}

export async function cancelOrderAction(
  id: string,
): Promise<OrderResult<Order>> {
  return orderRequest<Order>("POST", `/${encodeURIComponent(id)}/cancel`);
}
