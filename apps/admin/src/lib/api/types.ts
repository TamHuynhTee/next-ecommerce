// Shapes returned by the NestJS API (see apps/api products module).

export type CategoryStatus = "active" | "archived";
export type ProductStatus = "draft" | "active" | "inactive";

export type SubCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  subCategories: SubCategory[];
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string | null;
  color: string | null;
  size: string | null;
  unitPrice: string;
  originalPrice: string | null;
  currency: string;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  thumbnailUrl: string | null;
  categoryId: string;
  category: SubCategory & { category: Category };
  variants: ProductVariant[];
};

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

export type ActionState = { error?: string; ok?: boolean };
