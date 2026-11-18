import { Briefcase, ShoppingCart, Clock, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const icons = { revenue: Briefcase, orders: ShoppingCart, pending: Clock, customers: Users };

export type Stat = {
  label: string;
  value: string;
  hint: string;
  icon: keyof typeof icons;
  tone: "chart-1" | "chart-2" | "chart-3" | "chart-4";
};

export function StatCard({ stat }: { stat: Stat }) {
  const Icon = icons[stat.icon];
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-sm font-medium">{stat.label}</p>
            <p className="text-sm text-muted-foreground">{stat.hint}</p>
          </div>
          <Icon className="size-6" style={{ color: `var(--${stat.tone})` }} />
        </div>
      </CardContent>
    </Card>
  );
}
