import Link from "next/link";

import { StatusBadge } from "@/components/orders/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Order } from "@/lib/api/orders";
import { formatDate, formatVnd } from "@/lib/utils";

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div className="space-y-1.5">
          <CardTitle className="text-xl">Recent Orders</CardTitle>
          <CardDescription>Latest {orders.length} orders</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm"><Link href="/orders">View all</Link></Button>
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
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No orders yet.</TableCell></TableRow>
            ) : null}
            {orders.map((o) => (
              <TableRow key={o.id} className="h-14 odd:bg-muted/50 hover:bg-muted">
                <TableCell className="font-medium"><Link href={`/orders/${o.id}`} className="hover:underline">#{o.id.slice(0, 8)}</Link></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                        {`${o.customer.firstName[0] ?? ""}${o.customer.lastName[0] ?? ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="text-sm font-medium">{o.customer.firstName} {o.customer.lastName}</div>
                      <div className="text-xs text-muted-foreground">{o.customer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(o.createdAt)}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="text-right">{formatVnd(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
