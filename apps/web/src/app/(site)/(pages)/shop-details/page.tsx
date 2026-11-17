import { redirect } from "next/navigation";

// Product pages live under /shop-details/[slug]; keep old links working.
export default function ShopDetailsIndexPage() {
  redirect("/shop-without-sidebar");
}
