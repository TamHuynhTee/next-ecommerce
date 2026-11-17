import type { ProductStatus } from "@/lib/api/types";

export type VariantFormValues = {
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

export type ProductFormValues = {
  name: string;
  slug: string;
  categoryId: string;
  status: ProductStatus;
  description: string;
  thumbnailUrl: string;
  variants: VariantFormValues[];
};
