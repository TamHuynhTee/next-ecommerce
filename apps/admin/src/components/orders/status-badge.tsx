import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/api/orders";

const styles: Record<OrderStatus, string> = {
  pending: "bg-chart-4/25 text-amber-600 dark:text-chart-4",
  confirmed: "bg-secondary text-secondary-foreground",
  shipped: "bg-chart-2/20 text-chart-2",
  delivered: "bg-chart-3/20 text-chart-3",
  cancelled: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="secondary" className={`capitalize ${styles[status]}`}>
      {status}
    </Badge>
  );
}
