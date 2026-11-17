import { getCategories } from "@/lib/api/catalog";

import { ProductForm } from "../product-form";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
