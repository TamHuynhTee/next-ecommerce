import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import withProtectedRoute from "@/components/Auth/withProtectedRoute";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { formatPrice } from "@/lib/format";
import { orderRequest } from "@/lib/orders/api";
import type { Order } from "@/lib/orders/types";

export const metadata: Metadata = {
  title: "Order placed | NextCommerce",
};

const OrderSuccessPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const result = await orderRequest<Order>("GET", `/${encodeURIComponent(id)}`);
  if (result.ok !== true) notFound();
  const order = result.data;

  return (
    <main>
      <Breadcrumb title={"Order placed"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[770px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
            <h2 className="font-semibold text-2xl text-dark mb-2">
              Thank you for your order!
            </h2>
            <p className="mb-6">
              Order <span className="text-dark">#{order.id.slice(0, 8)}</span>{" "}
              is {order.status}. You will pay{" "}
              <span className="text-dark">{formatPrice(order.total)}</span> in
              cash on delivery.
            </p>

            {order.items.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between gap-4 py-4 border-t border-gray-3"
              >
                <p className="text-dark">
                  {item.name}{" "}
                  <span className="text-dark-4">× {item.quantity}</span>
                </p>
                <p className="text-dark whitespace-nowrap">
                  {formatPrice(item.lineTotal)}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between py-4 border-t border-gray-3">
              <p>Shipping fee</p>
              <p>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</p>
            </div>
            <div className="flex items-center justify-between py-4 border-t border-gray-3 font-medium text-dark">
              <p>Total</p>
              <p>{formatPrice(order.total)}</p>
            </div>

            <p className="text-custom-sm mt-2">
              Delivering to {order.customer.firstName} {order.customer.lastName},{" "}
              {order.customer.addressLine1}, {order.customer.city}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/my-account"
                className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                View my orders
              </Link>
              <Link
                href="/shop-without-sidebar"
                className="inline-flex font-medium text-dark bg-gray-1 border border-gray-3 py-3 px-6 rounded-md ease-out duration-200 hover:bg-gray-2"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default withProtectedRoute(
  OrderSuccessPage,
  "/checkout",
);
