import { Plus } from "lucide-react";
import Link from "next/link";

import { ConfirmDelete } from "@/components/confirm-delete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProducts } from "@/lib/api/catalog";
import type { Product, ProductStatus } from "@/lib/api/types";

import { deleteProductAction } from "./actions";

export const metadata = { title: "Products" };

const LIMIT = 10;
const statusStyle: Record<ProductStatus, string> = {
  active: "bg-chart-3/20 text-chart-3",
  draft: "bg-chart-4/25 text-amber-600 dark:text-chart-4",
  inactive: "bg-muted text-muted-foreground",
};

function priceRange(p: Product) {
  if (p.variants.length === 0) return "-";
  const prices = p.variants.map((v) => Number(v.unitPrice));
  const [min, max] = [Math.min(...prices), Math.max(...prices)];
  const currency = p.variants[0].currency;
  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${n} ${currency}`;
    }
  };
  return min === max ? fmt(min) : `${fmt(min)} - ${fmt(max)}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = (["draft", "active", "inactive"].includes(sp.status ?? "") ? sp.status : "") as ProductStatus | "";
  const { items, total } = await getProducts({ page, limit: LIMIT, search: sp.search, status });
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const link = (p: number) => {
    const q = new URLSearchParams();
    if (sp.search) q.set("search", sp.search);
    if (status) q.set("status", status);
    q.set("page", String(p));
    return `/products?${q}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">{total} products in your catalog</p>
        </div>
        <Button asChild><Link href="/products/new"><Plus /> Add product</Link></Button>
      </div>
      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardContent className="space-y-4">
          <form className="flex flex-wrap gap-3">
            <Input name="search" defaultValue={sp.search} placeholder="Search by name..." className="max-w-xs" />
            <select name="status" defaultValue={status} className="h-9 rounded-md border bg-transparent px-3 text-sm">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button type="submit" variant="outline">Filter</Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden sm:table-cell">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No products found.</TableCell></TableRow>
              ) : null}
              {items.map((p) => (
                <TableRow key={p.id} className="h-16">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnailUrl} alt="" className="size-10 rounded-md border object-cover" />
                      ) : (
                        <div className="size-10 rounded-md bg-muted" />
                      )}
                      <div className="leading-tight">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.variants.length} variant(s)</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{p.category?.category?.name} / {p.category?.name}</TableCell>
                  <TableCell><Badge variant="secondary" className={statusStyle[p.status]}>{p.status}</Badge></TableCell>
                  <TableCell>{priceRange(p)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{p.variants.reduce((n, v) => n + v.stock, 0)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <Button asChild variant="ghost" size="sm"><Link href={`/products/${p.id}/edit`}>Edit</Link></Button>
                      <ConfirmDelete title={`Delete "${p.name}"?`} description="The product and its variants will be removed." action={deleteProductAction.bind(null, p.id)} label="" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-2">
              {/* A disabled <Button asChild> does not stop a Link, so render a real disabled button instead. */}
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
