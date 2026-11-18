"use client";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { formatPrice } from "@/lib/format";
import { cancelOrderAction, listOrdersAction } from "@/lib/orders/actions";
import type { Order, OrderStatus } from "@/lib/orders/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "text-yellow bg-yellow-light-4",
  confirmed: "text-blue bg-blue-light-5",
  shipped: "text-blue bg-blue-light-5",
  delivered: "text-green bg-green-light-6",
  cancelled: "text-red bg-red-light-6",
};

function OrderRow({
  order,
  onCancel,
  cancelling,
}: {
  order: Order;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-gray-3 py-4.5 px-4 sm:px-7.5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-[111px]">
          <p className="text-custom-sm text-dark">#{order.id.slice(0, 8)}</p>
        </div>
        <div className="min-w-[140px]">
          <p className="text-custom-sm text-dark">
            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="min-w-[110px]">
          <span
            className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${STATUS_STYLES[order.status]}`}
          >
            {order.status}
          </span>
        </div>
        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark">{formatPrice(order.total)}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-custom-sm text-blue hover:underline"
          >
            {open ? "Hide details" : "Details"}
          </button>
          {order.status === "pending" && (
            <button
              type="button"
              disabled={cancelling}
              onClick={() => onCancel(order.id)}
              className="text-custom-sm text-red hover:underline disabled:opacity-60"
            >
              {cancelling ? "Cancelling…" : "Cancel"}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4 text-custom-sm">
          {order.items.map((item) => (
            <div key={item.sku} className="flex justify-between gap-4 py-1.5">
              <span className="text-dark">
                {item.name} <span className="text-dark-4">× {item.quantity}</span>
              </span>
              <span className="text-dark whitespace-nowrap">
                {formatPrice(item.lineTotal)}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-1.5">
            <span>Shipping fee</span>
            <span>
              {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
            </span>
          </div>
          <p className="mt-2">
            Delivering to {order.customer.firstName} {order.customer.lastName},{" "}
            {order.customer.addressLine1}, {order.customer.city} · Cash on
            delivery
          </p>
        </div>
      )}
    </div>
  );
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await listOrdersAction(1);
    if (result.ok === true) {
      setOrders(result.data.items);
    } else {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    const result = await cancelOrderAction(id);
    if (result.ok === true) {
      setOrders(
        (current) =>
          current?.map((o) => (o.id === id ? result.data : o)) ?? current,
      );
      toast.success("Order cancelled");
    } else {
      toast.error("This order can no longer be cancelled.");
      await load();
    }
    setCancellingId(null);
  };

  if (failed) {
    return (
      <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
        Could not load your orders. Please try again later.
      </p>
    );
  }
  if (!orders) {
    return <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">Loading…</p>;
  }
  if (orders.length === 0) {
    return (
      <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
        You don&apos;t have any orders yet.
      </p>
    );
  }

  return (
    <div className="w-full">
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          onCancel={handleCancel}
          cancelling={cancellingId === order.id}
        />
      ))}
    </div>
  );
};

export default Orders;
