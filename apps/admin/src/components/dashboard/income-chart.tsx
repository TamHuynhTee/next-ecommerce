"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatVnd } from "@/lib/utils";

const config = { revenue: { label: "Revenue", color: "var(--chart-1)" } } satisfies ChartConfig;

export function IncomeChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle className="text-xl">Monthly Revenue</CardTitle>
        <CardDescription>Last 12 months, cancelled orders excluded</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-64 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(m: string) => m.slice(2)} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatVnd(Number(value))} />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
