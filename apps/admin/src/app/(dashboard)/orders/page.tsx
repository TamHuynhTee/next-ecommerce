import { RecentOrders } from "@/components/dashboard/recent-orders";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <PlaceholderPage title="Orders" description="Track and fulfil customer orders">
      <RecentOrders />
    </PlaceholderPage>
  );
}
