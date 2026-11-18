import Link from "next/link";

import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrders, ORDER_STATUSES, type OrderStatus } from "@/lib/api/orders";
import { formatDate, formatVnd } from "@/lib/utils";

export const metadata = { title: "Orders" };

const LIMIT = 10;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.min(1_000_000, Number(sp.page) || 1));
  const status = (ORDER_STATUSES.includes(sp.status as OrderStatus) ? sp.status : "") as OrderStatus | "";
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const { items, total } = await getOrders({ page, limit: LIMIT, status, q });
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const link = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("page", String(p));
    return `/orders?${params}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">{total} orders</p>
      </div>
      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardContent className="space-y-4">
          <form className="flex flex-wrap gap-3">
            <Input name="q" defaultValue={q} placeholder="Order id, customer name or email..." className="max-w-xs" />
            <select name="status" defaultValue={status} className="h-9 rounded-md border bg-transparent px-3 text-sm capitalize">
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button type="submit" variant="outline">Filter</Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No orders found.</TableCell></TableRow>
              ) : null}
              {items.map((o) => (
                <TableRow key={o.id} className="h-14">
                  <TableCell className="font-medium">#{o.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="leading-tight">
                      <div className="text-sm font-medium">{o.customer.firstName} {o.customer.lastName}</div>
                      <div className="text-xs text-muted-foreground">{o.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(o.createdAt)}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-right">{formatVnd(o.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm"><Link href={`/orders/${o.id}`}>View</Link></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-2">
              {page <= 1 ? (
                <Button variant="outline" size="sm" disabled>Previous</Button>
              ) : (
                <Button asChild variant="outline" size="sm"><Link href={link(Math.min(page - 1, pages))}>Previous</Link></Button>
              )}
              {page >= pages ? (
                <Button variant="outline" size="sm" disabled>Next</Button>
              ) : (
                <Button asChild variant="outline" size="sm"><Link href={link(page + 1)}>Next</Link></Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
