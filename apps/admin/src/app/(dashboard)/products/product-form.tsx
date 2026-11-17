"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, type FieldError } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Product } from "@/lib/api/types";
import { slugify } from "@/lib/slugify";

import { loadCategoriesAction, saveProductAction } from "./actions";
import type { ProductFormValues, VariantFormValues } from "./form-types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;

const emptyVariant = (): VariantFormValues => ({
  sku: "",
  name: "",
  color: "",
  size: "",
  unitPrice: "",
  originalPrice: "",
  currency: "VND",
  stock: "0",
  imageUrl: "",
  isActive: true,
});

const toVariant = (v: Product["variants"][number]): VariantFormValues => ({
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

const categoryLabel = (parent: string | undefined, name: string) => (parent ? `${parent} / ${name}` : name);

export function ProductForm({ product }: { product?: Product }) {
  const [serverError, setServerError] = useState<string>();
  const [pending, start] = useTransition();
  // Once the user edits the slug by hand, stop deriving it from the name.
  const slugTouched = useRef(!!product);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      categoryId: product?.categoryId ?? "",
      status: product?.status ?? "draft",
      description: product?.description ?? "",
      thumbnailUrl: product?.thumbnailUrl ?? "",
      variants: product?.variants.length ? product.variants.map(toVariant) : [emptyVariant()],
    },
  });
  // keyName avoids clashing with the variant's own `id`, which the API needs to update existing rows.
  const { fields, append, remove } = useFieldArray({ control, name: "variants", keyName: "_key" });
  const thumb = watch("thumbnailUrl");

  const onSubmit = handleSubmit((values) => {
    setServerError(undefined);
    start(async () => {
      const result = await saveProductAction(product?.id, values);
      if (result?.error) setServerError(result.error);
    });
  });

  const nameField = register("name", {
    required: "Name is required.",
    maxLength: { value: 100, message: "Name is at most 100 characters." },
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Name" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              aria-invalid={!!errors.name}
              {...nameField}
              onChange={(e) => {
                void nameField.onChange(e);
                if (!slugTouched.current) setValue("slug", slugify(e.target.value), { shouldValidate: true });
              }}
            />
          </Field>
          <Field label="Slug" htmlFor="slug" error={errors.slug}>
            <Input
              id="slug"
              aria-invalid={!!errors.slug}
              {...register("slug", {
                required: "Slug is required.",
                pattern: { value: SLUG_PATTERN, message: "Use lowercase letters, numbers and dashes." },
                onChange: () => {
                  slugTouched.current = true;
                },
              })}
            />
          </Field>
          <Field label="Sub-category" error={errors.categoryId}>
            <Controller
              control={control}
              name="categoryId"
              rules={{ required: "Select a sub-category." }}
              render={({ field }) => (
                <SubCategorySelect
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.categoryId}
                  initialLabel={
                    product ? categoryLabel(product.category?.category?.name, product.category?.name) : undefined
                  }
                />
              )}
            />
          </Field>
          <Field label="Status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Description" htmlFor="description" className="md:col-span-2">
            <Textarea id="description" rows={4} {...register("description")} />
          </Field>
          <Field label="Thumbnail URL" htmlFor="thumbnailUrl" error={errors.thumbnailUrl} className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Input
                id="thumbnailUrl"
                placeholder="https://..."
                aria-invalid={!!errors.thumbnailUrl}
                {...register("thumbnailUrl", {
                  validate: (v) => !v.trim() || URL_PATTERN.test(v.trim()) || "Enter a valid http(s) URL.",
                })}
              />
              {thumb && URL_PATTERN.test(thumb.trim()) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb.trim()} alt="" className="size-10 shrink-0 rounded-md border object-cover" />
              ) : null}
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Variants</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => append(emptyVariant())}>
            <Plus /> Add variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, i) => {
            const err = errors.variants?.[i];
            const name = <K extends keyof VariantFormValues>(key: K) => `variants.${i}.${key}` as const;
            return (
              <div key={field._key} className="space-y-3 rounded-lg border p-4">
                <input type="hidden" {...register(name("id"))} />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Variant {i + 1}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Controller
                        control={control}
                        name={name("isActive")}
                        render={({ field: f }) => <Switch checked={!!f.value} onCheckedChange={f.onChange} />}
                      />
                      Active
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove variant"
                      disabled={fields.length === 1}
                      onClick={() => remove(i)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="SKU" small error={err?.sku}>
                    <Input
                      aria-invalid={!!err?.sku}
                      {...register(name("sku"), { required: "SKU is required.", setValueAs: (v: string) => v.trim() })}
                    />
                  </Field>
                  <Field label="Name" small>
                    <Input {...register(name("name"))} />
                  </Field>
                  <Field label="Color" small>
                    <Input {...register(name("color"))} />
                  </Field>
                  <Field label="Size" small>
                    <Input {...register(name("size"))} />
                  </Field>
                  <Field label="Unit price" small error={err?.unitPrice}>
                    <Input
                      inputMode="numeric"
                      aria-invalid={!!err?.unitPrice}
                      {...register(name("unitPrice"), {
                        required: "Unit price is required.",
                        pattern: { value: /^\d+$/, message: "Digits only." },
                      })}
                    />
                  </Field>
                  <Field label="Original price" small error={err?.originalPrice}>
                    <Input
                      inputMode="numeric"
                      aria-invalid={!!err?.originalPrice}
                      {...register(name("originalPrice"), { pattern: { value: /^\d*$/, message: "Digits only." } })}
                    />
                  </Field>
                  <Field label="Currency" small error={err?.currency}>
                    <Input
                      maxLength={3}
                      aria-invalid={!!err?.currency}
                      {...register(name("currency"), {
                        required: "Currency is required.",
                        pattern: { value: /^[A-Za-z]{3}$/, message: "Use a 3-letter code." },
                      })}
                    />
                  </Field>
                  <Field label="Stock" small error={err?.stock}>
                    <Input
                      inputMode="numeric"
                      aria-invalid={!!err?.stock}
                      {...register(name("stock"), {
                        required: "Stock is required.",
                        pattern: { value: /^\d+$/, message: "Whole number, 0 or more." },
                      })}
                    />
                  </Field>
                  <Field label="Image URL" small error={err?.imageUrl} className="sm:col-span-2 lg:col-span-4">
                    <Input
                      placeholder="https://..."
                      aria-invalid={!!err?.imageUrl}
                      {...register(name("imageUrl"), {
                        validate: (v) => !v.trim() || URL_PATTERN.test(v.trim()) || "Enter a valid http(s) URL.",
                      })}
                    />
                  </Field>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {serverError ? (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : product ? "Save changes" : "Create product"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

/** Sub-category picker that fetches the category tree the first time it is opened. */
function SubCategorySelect({
  value,
  onChange,
  invalid,
  initialLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  initialLabel?: string;
}) {
  const [categories, setCategories] = useState<Category[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  // The list is not loaded yet when editing, so keep the current label separately.
  const [label, setLabel] = useState(initialLabel);

  const load = async () => {
    setLoading(true);
    setError(undefined);
    const result = await loadCategoriesAction();
    if (result.categories) setCategories(result.categories);
    else setError(result.error ?? "Could not load categories.");
    setLoading(false);
  };

  return (
    <Select
      value={value}
      onOpenChange={(open) => {
        if (open && !categories && !loading) void load();
      }}
      onValueChange={(id) => {
        if (!id) return;
        onChange(id);
        for (const c of categories ?? []) {
          const sub = c.subCategories.find((s) => s.id === id);
          if (sub) setLabel(categoryLabel(c.name, sub.name));
        }
      }}
    >
      <SelectTrigger className="w-full" aria-invalid={invalid}>
        <SelectValue placeholder="Select a sub-category">{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {loading ? <p className="px-2 py-1.5 text-sm text-muted-foreground">Loading categories...</p> : null}
        {error ? (
          <p role="alert" className="px-2 py-1.5 text-sm text-destructive">
            {error} Close and reopen to retry.
          </p>
        ) : null}
        {categories?.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">No categories yet. Create one first.</p>
        ) : null}
        {categories?.map((c) => (
          <SelectGroup key={c.id}>
            <SelectLabel>{c.name}</SelectLabel>
            {c.subCategories.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

function Field({
  label,
  htmlFor,
  error,
  small,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: FieldError;
  small?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={htmlFor} className={small ? "text-xs text-muted-foreground" : undefined}>
        {label}
      </Label>
      {children}
      {error?.message ? <p className="text-xs text-destructive">{error.message}</p> : null}
    </div>
  );
}
