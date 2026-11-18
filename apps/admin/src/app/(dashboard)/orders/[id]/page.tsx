import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusActions } from "@/components/orders/status-actions";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/lib/api-client";
import { getOrder, NEXT_STATUSES } from "@/lib/api/orders";
import { formatDate, formatVnd } from "@/lib/utils";

import { updateOrderStatusAction } from "./actions";

export const metadata = { title: "Order" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const order = await getOrder(id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const { customer } = order;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2"><Link href="/orders"><ArrowLeft /> All orders</Link></Button>
          <h1 className="text-4xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardHeader><CardTitle>Fulfilment</CardTitle></CardHeader>
        <CardContent>
          <StatusActions next={NEXT_STATUSES[order.status]} update={updateOrderStatusAction.bind(null, order.id)} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:col-span-2">
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">SKU {item.sku}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatVnd(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatVnd(item.lineTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <dl className="mt-4 ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatVnd(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shippingFee === 0 ? "Free" : formatVnd(order.shippingFee)}</dd></div>
              <div className="flex justify-between border-t pt-2 font-semibold"><dt>Total</dt><dd>{formatVnd(order.total)}</dd></div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{customer.firstName} {customer.lastName}</p>
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
            </CardContent>
          </Card>
          <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <CardHeader><CardTitle>Delivery address</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{customer.addressLine1}</p>
              {customer.addressLine2 ? <p>{customer.addressLine2}</p> : null}
              <p>{customer.city} {customer.postalCode}</p>
              <p>{customer.country}</p>
            </CardContent>
          </Card>
          <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="uppercase">{order.payment?.provider ?? "-"}</p>
              <p className="capitalize text-muted-foreground">{order.payment?.status ?? "-"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
