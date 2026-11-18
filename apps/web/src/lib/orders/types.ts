export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  variantId: string | null;
  name: string;
  slug: string;
  sku: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  currency: string;
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

export type OrderPage = {
  items: Order[];
  total: number;
  page: number;
  limit: number;
};

/** A cart line the API refused to order. */
export type CartIssue = {
  variantId: string;
  title: string;
  reason: "UNAVAILABLE" | "OUT_OF_STOCK";
  available: number;
};

export type CreateOrderInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
};

export type OrderResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      /** Validation messages from the API, when there are any. */
      details?: string[];
      issues?: CartIssue[];
    };
