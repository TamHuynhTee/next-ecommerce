"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ordersByChannel } from "@/lib/mock-data";

const config = {
  value: { label: "Share" },
  direct: { label: "Direct", color: "var(--chart-1)" },
  social: { label: "Social", color: "var(--chart-2)" },
  email: { label: "Email", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ChannelChart() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle className="text-xl">Orders by Channel</CardTitle>
        <CardDescription>November 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square max-h-64">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="channel" />} />
            <Pie data={ordersByChannel} dataKey="value" nameKey="channel" stroke="var(--card)" strokeWidth={2} label={({ value }) => `${value}%`} />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-5 text-sm text-muted-foreground">
          {(["direct", "social", "email"] as const).map((k) => (
            <span key={k} className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: config[k].color }} />
              {config[k].label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
