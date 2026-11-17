// Shapes returned by the NestJS API (see apps/api products module).

export type ApiSubCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string;
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "archived";
  subCategories: ApiSubCategory[];
};

export type ApiVariant = {
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

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "draft" | "active" | "inactive";
  thumbnailUrl: string | null;
  categoryId: string;
  category?: ApiSubCategory & { category?: ApiCategory };
  variants: ApiVariant[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type ProductSort = "newest" | "price_asc" | "price_desc";

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  /** Sub-category id. */
  categoryId?: string;
  /** Top-level category id. */
  parentCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
};
