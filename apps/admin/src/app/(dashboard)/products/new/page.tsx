import { ProductForm } from "../product-form";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">New product</h1>
      <ProductForm />
    </div>
  );
}
