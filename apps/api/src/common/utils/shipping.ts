/** Flat shipping fee in whole VND. */
export const SHIPPING_FEE = 30_000;
/** Orders at or above this subtotal ship for free. */
export const FREE_SHIPPING_THRESHOLD = 500_000;

export function shippingFeeFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
