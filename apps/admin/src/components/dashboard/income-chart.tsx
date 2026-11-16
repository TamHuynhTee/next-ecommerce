"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { monthlyIncome } from "@/lib/mock-data";

const config = { income: { label: "Income", color: "var(--chart-1)" } } satisfies ChartConfig;

export function IncomeChart() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle className="text-xl">Income Amounts</CardTitle>
        <CardDescription>Monthly, 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-64 w-full">
          <BarChart data={monthlyIncome}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
