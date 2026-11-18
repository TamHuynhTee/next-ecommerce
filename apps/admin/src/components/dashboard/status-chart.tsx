"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { OrderStatus } from "@/lib/api/orders";

const config = {
  count: { label: "Orders" },
  pending: { label: "Pending", color: "var(--chart-4)" },
  confirmed: { label: "Confirmed", color: "var(--chart-1)" },
  shipped: { label: "Shipped", color: "var(--chart-2)" },
  delivered: { label: "Delivered", color: "var(--chart-3)" },
  cancelled: { label: "Cancelled", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function StatusChart({ data }: { data: { status: OrderStatus; count: number }[] }) {
  const shown = data.filter((d) => d.count > 0).map((d) => ({ ...d, fill: config[d.status].color }));
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle className="text-xl">Orders by Status</CardTitle>
        <CardDescription>All time</CardDescription>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <>
            <ChartContainer config={config} className="mx-auto aspect-square max-h-64">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
                <Pie data={shown} dataKey="count" nameKey="status" stroke="var(--card)" strokeWidth={2} label={({ value }) => value} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {shown.map((d) => (
                <span key={d.status} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: config[d.status].color }} />
                  {config[d.status].label}
                </span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
