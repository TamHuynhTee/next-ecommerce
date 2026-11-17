import React, { Suspense } from "react";
import { Metadata } from "next";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { getCategories, getProducts } from "@/lib/catalog/api";
import {
  flattenParams,
  SHOP_PAGE_SIZE,
  toProductQuery,
  type RawSearchParams,
} from "@/lib/catalog/shop-params";

export const metadata: Metadata = {
  title: "Shop | NextCommerce",
  description: "Browse all products",
};

async function ShopContent({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = flattenParams(await searchParams);
  const categories = await getCategories();
  const { query, page, sort } = toProductQuery(params, categories);
  const { items, total } = await getProducts(query);

  return (
    <ShopWithSidebar
      categories={categories}
      products={items}
      total={total}
      page={page}
      limit={SHOP_PAGE_SIZE}
      sort={sort}
      params={params}
    />
  );
}

const ShopWithSidebarPage = (props: { searchParams: Promise<RawSearchParams> }) => (
  <main>
    <Suspense fallback={<div className="min-h-screen" />}>
      <ShopContent searchParams={props.searchParams} />
    </Suspense>
  </main>
);

export default ShopWithSidebarPage;
