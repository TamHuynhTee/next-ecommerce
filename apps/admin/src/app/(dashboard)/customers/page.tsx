import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustomers } from "@/lib/api/orders";
import { formatDate, formatVnd } from "@/lib/utils";

export const metadata = { title: "Customers" };

const LIMIT = 10;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.min(1_000_000, Number(sp.page) || 1));
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const { items, total } = await getCustomers({ page, limit: LIMIT, q });
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const link = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/customers?${params}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Customers</h1>
        <p className="mt-2 text-sm text-muted-foreground">{total} registered customers</p>
      </div>
      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardContent className="space-y-4">
          <form className="flex flex-wrap gap-3">
            <Input name="q" defaultValue={q} placeholder="Name, username or email..." className="max-w-xs" />
            <Button type="submit" variant="outline">Search</Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No customers found.</TableCell></TableRow>
              ) : null}
              {items.map((c) => (
                <TableRow key={c.id} className="h-14">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                          {`${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div className="text-sm font-medium">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(c.createdAt)}</TableCell>
                  <TableCell className="text-right">{c.orderCount}</TableCell>
                  <TableCell className="text-right">{formatVnd(c.totalSpent)}</TableCell>
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
