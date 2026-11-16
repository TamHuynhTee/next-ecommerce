import { MoreVertical } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { recentOrders, type OrderStatus } from "@/lib/mock-data";

const statusStyles: Record<OrderStatus, string> = {
  Paid: "bg-chart-3/20 text-chart-3",
  Pending: "bg-chart-4/25 text-amber-600 dark:text-chart-4",
  Shipped: "bg-secondary text-secondary-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
};

export function RecentOrders() {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div className="space-y-1.5">
          <CardTitle className="text-xl">Recent Orders</CardTitle>
          <CardDescription>Last 2 days</CardDescription>
        </div>
        <MoreVertical className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((o) => (
              <TableRow key={o.id} className="h-14 odd:bg-muted/50 hover:bg-muted">
                <TableCell className="font-medium">{o.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                        {o.customer.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="text-sm font-medium">{o.customer}</div>
                      <div className="text-xs text-muted-foreground">{o.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{o.date}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusStyles[o.status]}>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{o.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
