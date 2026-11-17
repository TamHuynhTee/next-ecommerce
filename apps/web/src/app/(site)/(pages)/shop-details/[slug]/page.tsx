import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopDetails from "@/components/ShopDetails";
import RelatedProducts from "@/components/ShopDetails/RelatedProducts";
import { getProductBySlug } from "@/lib/catalog/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.title} | NextCommerce`,
    description: product.description ?? undefined,
  };
}

async function ProductContent({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <ShopDetails
      product={product}
      related={
        <Suspense>
          <RelatedProducts product={product} />
        </Suspense>
      }
    />
  );
}

const ShopDetailsPage = (props: Props) => (
  <main>
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductContent {...props} />
    </Suspense>
  </main>
);

export default ShopDetailsPage;
