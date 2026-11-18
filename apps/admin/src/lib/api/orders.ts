import "server-only";

import { apiFetch } from "@/lib/api-client";
import type { Paginated } from "./types";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

/** Next steps the API accepts from each status (mirrors the API rules). */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export type OrderItem = {
  variantId: string | null;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    postalCode: string;
    country: string;
  };
  payment: { provider: string; status: string } | null;
  items: OrderItem[];
};

export type OrderQuery = { page?: number; limit?: number; status?: OrderStatus | ""; q?: string };

const toQuery = (query: Record<string, unknown>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, String(value));
  return params.toString();
};

export const getOrders = (query: OrderQuery = {}) => apiFetch<Paginated<Order>>(`/orders/admin?${toQuery(query)}`);

export const getOrder = (id: string) => apiFetch<Order>(`/orders/admin/${id}`);

export type Stats = {
  monthRevenue: number;
  monthOrders: number;
  pendingOrders: number;
  newCustomers: number;
  daily: { day: string; revenue: number }[];
  monthly: { month: string; revenue: number }[];
  byStatus: { status: OrderStatus; count: number }[];
};

export const getStats = () => apiFetch<Stats>("/orders/admin/stats");

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
};

export const getCustomers = (query: { page?: number; limit?: number; q?: string } = {}) =>
  apiFetch<Paginated<Customer>>(`/users/admin?${toQuery(query)}`);
