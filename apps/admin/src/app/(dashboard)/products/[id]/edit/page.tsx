import { notFound } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import { getCategories, getProduct } from "@/lib/api/catalog";

import { ProductForm } from "../../product-form";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    getCategories(),
    getProduct(id).catch((e) => {
      if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
      throw e;
    }),
  ]);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Edit product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
