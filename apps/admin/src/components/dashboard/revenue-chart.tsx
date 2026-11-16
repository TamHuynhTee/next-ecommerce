"use client";

import { Area, AreaChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { revenueTrend } from "@/lib/mock-data";

const config = { revenue: { label: "Revenue", color: "var(--chart-1)" } } satisfies ChartConfig;

export function RevenueChart() {
  return (
    <Card className="gap-0 overflow-hidden pb-0 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardHeader className="pb-4">
        <CardDescription>Revenue</CardDescription>
        <CardTitle className="text-3xl font-bold">$165,750.23</CardTitle>
        <CardDescription>From 262 orders</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ChartContainer config={config} className="h-48 w-full">
          <AreaChart data={revenueTrend} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Area dataKey="revenue" type="monotone" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.15} strokeWidth={1.5} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
