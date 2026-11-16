// Mocked data for the scaffold. Replace with calls through `lib/api-client.ts` later.

export const stats = [
  { label: "Revenue this month", value: "$22,880.50", hint: "From 18 orders", progress: 67, tone: "chart-1", icon: "briefcase" },
  { label: "Daily average income", value: "$1,096.30", hint: "Last 30 days", progress: 18, tone: "chart-2", icon: "wallet" },
  { label: "Conversion rate", value: "33.98%", hint: "Visitors to buyers", progress: 78, tone: "chart-3", icon: "trending" },
  { label: "Newsletters sent", value: "778", hint: "This quarter", progress: 80, tone: "chart-4", icon: "send" },
] as const;

export const ordersByChannel = [
  { channel: "direct", value: 45, fill: "var(--color-direct)" },
  { channel: "social", value: 30, fill: "var(--color-social)" },
  { channel: "email", value: 25, fill: "var(--color-email)" },
];

export const monthlyIncome = [
  { month: "Jan", income: 4200 }, { month: "Feb", income: 3100 }, { month: "Mar", income: 5200 },
  { month: "Apr", income: 4700 }, { month: "May", income: 6100 }, { month: "Jun", income: 5600 },
  { month: "Jul", income: 7400 }, { month: "Aug", income: 6900 }, { month: "Sep", income: 8100 },
  { month: "Oct", income: 7300 }, { month: "Nov", income: 9000 }, { month: "Dec", income: 8600 },
];

export const revenueTrend = Array.from({ length: 40 }, (_, i) => ({
  day: i + 1,
  revenue: Math.round(9000 + Math.sin(i / 5) * 3000 + (i > 22 ? (i - 22) * 250 : 0) + ((i * 37) % 11) * 90),
}));

export type OrderStatus = "Paid" | "Pending" | "Shipped" | "Cancelled";

export const recentOrders: { id: string; customer: string; email: string; date: string; total: string; status: OrderStatus }[] = [
  { id: "#3210", customer: "Mathilda Bell", email: "mathilda@example.com", date: "Nov 14, 2026", total: "$192.00", status: "Paid" },
  { id: "#3209", customer: "Marion Figueroa", email: "marion@example.com", date: "Nov 14, 2026", total: "$100.50", status: "Pending" },
  { id: "#3208", customer: "Lee Barrett", email: "lee@example.com", date: "Nov 13, 2026", total: "$420.00", status: "Shipped" },
  { id: "#3207", customer: "Joseph Brooks", email: "joseph@example.com", date: "Nov 12, 2026", total: "$68.00", status: "Cancelled" },
  { id: "#3206", customer: "Ava Collins", email: "ava@example.com", date: "Nov 12, 2026", total: "$254.90", status: "Paid" },
];
