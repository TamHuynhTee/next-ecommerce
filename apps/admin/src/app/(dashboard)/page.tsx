import { IncomeChart } from "@/components/dashboard/income-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard, type Stat } from "@/components/dashboard/stat-card";
import { StatusChart } from "@/components/dashboard/status-chart";
import { getSession } from "@/lib/auth/session";
import { getOrders, getStats } from "@/lib/api/orders";
import { formatVnd } from "@/lib/utils";

export default async function DashboardPage() {
  const [user, stats, recent] = await Promise.all([getSession(), getStats(), getOrders({ page: 1, limit: 5 })]);

  const cards: Stat[] = [
    { label: "Revenue this month", value: formatVnd(stats.monthRevenue), hint: "Cancelled orders excluded", icon: "revenue", tone: "chart-1" },
    { label: "Orders this month", value: String(stats.monthOrders), hint: "Excluding cancelled", icon: "orders", tone: "chart-2" },
    { label: "Pending orders", value: String(stats.pendingOrders), hint: "Waiting to be confirmed", icon: "pending", tone: "chart-4" },
    { label: "New customers", value: String(stats.newCustomers), hint: "Last 30 days", icon: "customers", tone: "chart-3" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Hi {user?.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Welcome back to your store dashboard</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((s) => <StatCard key={s.label} stat={s} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusChart data={stats.byStatus} />
        <IncomeChart data={stats.monthly} />
      </div>
      <RevenueChart data={stats.daily} />
      <RecentOrders orders={recent.items} />
    </div>
  );
}
