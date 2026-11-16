import { Download, Plus } from "lucide-react";

import { ChannelChart } from "@/components/dashboard/channel-chart";
import { IncomeChart } from "@/components/dashboard/income-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { stats } from "@/lib/mock-data";

export default async function DashboardPage() {
  const user = await getSession();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Hi {user?.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back to your store dashboard</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-card"><Download /> Download</Button>
          <Button><Plus /> Add Widget</Button>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {stats.map((s) => <StatCard key={s.label} stat={s} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelChart />
        <IncomeChart />
      </div>
      <RevenueChart />
      <RecentOrders />
    </div>
  );
}
