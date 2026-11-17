"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState, Category, Product } from "@/lib/api/types";
import { slugify } from "@/lib/slugify";

import { saveProductAction } from "./actions";

type Variant = {
  id?: string;
  sku: string;
  name: string;
  color: string;
  size: string;
  unitPrice: string;
  originalPrice: string;
  currency: string;
  stock: string;
  imageUrl: string;
  isActive: boolean;
};

const emptyVariant = (): Variant => ({
  sku: "", name: "", color: "", size: "", unitPrice: "", originalPrice: "", currency: "VND", stock: "0", imageUrl: "", isActive: true,
});

const toVariant = (v: Product["variants"][number]): Variant => ({
  id: v.id,
  sku: v.sku,
  name: v.name ?? "",
  color: v.color ?? "",
  size: v.size ?? "",
  unitPrice: v.unitPrice,
  originalPrice: v.originalPrice ?? "",
  currency: v.currency,
  stock: String(v.stock),
  imageUrl: v.imageUrl ?? "",
  isActive: v.isActive,
});

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProductAction, {});
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [thumb, setThumb] = useState(product?.thumbnailUrl ?? "");
  // Controlled so React 19's post-action form reset does not wipe them after a failed submit.
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [status, setStatus] = useState<string>(product?.status ?? "draft");
  const [description, setDescription] = useState(product?.description ?? "");
  const [variants, setVariants] = useState<Variant[]>(product?.variants.length ? product.variants.map(toVariant) : [emptyVariant()]);

  const patch = (i: number, change: Partial<Variant>) =>
    setVariants((list) => list.map((v, idx) => (idx === i ? { ...v, ...change } : v)));

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required maxLength={100} value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" required value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} />
          </div>
          <div className="space-y-1.5">
            <Label>Sub-category</Label>
            <input type="hidden" name="categoryId" value={categoryId} />
            <Select value={categoryId} onValueChange={(v) => { if (v) setCategoryId(v); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select a sub-category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectGroup key={c.id}>
                    <SelectLabel>{c.name}</SelectLabel>
                    {c.subCategories.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <input type="hidden" name="status" value={status} />
            <Select value={status} onValueChange={(v) => { if (v) setStatus(v); }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <div className="flex items-center gap-3">
              <Input id="thumbnailUrl" name="thumbnailUrl" type="url" placeholder="https://..." value={thumb} onChange={(e) => setThumb(e.target.value)} />
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" className="size-10 shrink-0 rounded-md border object-cover" />
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Variants</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setVariants((l) => [...l, emptyVariant()])}>
            <Plus /> Add variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.map((v, i) => (
            <div key={v.id ?? i} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Variant {i + 1}</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={v.isActive} onCheckedChange={(checked) => patch(i, { isActive: checked })} /> Active
                  </label>
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove variant" disabled={variants.length === 1} onClick={() => setVariants((l) => l.filter((_, idx) => idx !== i))}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="SKU"><Input required value={v.sku} onChange={(e) => patch(i, { sku: e.target.value })} /></Field>
                <Field label="Name"><Input value={v.name} onChange={(e) => patch(i, { name: e.target.value })} /></Field>
                <Field label="Color"><Input value={v.color} onChange={(e) => patch(i, { color: e.target.value })} /></Field>
                <Field label="Size"><Input value={v.size} onChange={(e) => patch(i, { size: e.target.value })} /></Field>
                <Field label="Unit price"><Input required inputMode="numeric" pattern="\d+" value={v.unitPrice} onChange={(e) => patch(i, { unitPrice: e.target.value })} /></Field>
                <Field label="Original price"><Input inputMode="numeric" pattern="\d*" value={v.originalPrice} onChange={(e) => patch(i, { originalPrice: e.target.value })} /></Field>
                <Field label="Currency"><Input required maxLength={3} value={v.currency} onChange={(e) => patch(i, { currency: e.target.value })} /></Field>
                <Field label="Stock"><Input required type="number" min={0} value={v.stock} onChange={(e) => patch(i, { stock: e.target.value })} /></Field>
                <Field label="Image URL" className="sm:col-span-2 lg:col-span-4"><Input type="url" placeholder="https://..." value={v.imageUrl} onChange={(e) => patch(i, { imageUrl: e.target.value })} /></Field>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : product ? "Save changes" : "Create product"}</Button>
        <Button asChild variant="outline"><Link href="/products">Cancel</Link></Button>
      </div>
    </form>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
