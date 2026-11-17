const vnd = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

/** Formats a whole-VND amount, e.g. 199000 -> "199.000 ₫". */
export const formatPrice = (amount: number) => vnd.format(amount);
