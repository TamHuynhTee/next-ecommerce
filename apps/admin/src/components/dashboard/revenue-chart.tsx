"use client";

import { Area, AreaChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatVnd } from "@/lib/utils";

const config = { revenue: { label: "Revenue", color: "var(--chart-1)" } } satisfies ChartConfig;

export function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  return (
    <Card className="gap-0 overflow-hidden pb-0 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardHeader className="pb-4">
        <CardDescription>Revenue, last 30 days</CardDescription>
        <CardTitle className="text-3xl font-bold">{formatVnd(total)}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ChartContainer config={config} className="h-48 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatVnd(Number(value))} />} />
            <Area dataKey="revenue" type="monotone" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.15} strokeWidth={1.5} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
