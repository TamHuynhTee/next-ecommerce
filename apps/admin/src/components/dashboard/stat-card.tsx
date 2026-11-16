import { Briefcase, Send, TrendingUp, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { stats } from "@/lib/mock-data";

const icons = { briefcase: Briefcase, wallet: Wallet, trending: TrendingUp, send: Send };
type Stat = (typeof stats)[number];

export function StatCard({ stat }: { stat: Stat }) {
  const Icon = icons[stat.icon];
  const color = `var(--${stat.tone})`;
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.hint}</p>
          </div>
          <Icon className="size-6" style={{ color }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${stat.progress}%`, backgroundColor: color }} />
          </div>
          <span className="text-xs text-muted-foreground">{stat.progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
