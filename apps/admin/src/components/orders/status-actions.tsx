"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { OrderStatus } from "@/lib/api/orders";
import type { ActionState } from "@/lib/api/types";

const LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: "Confirm order",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel order",
};

type Props = { next: OrderStatus[]; update: (status: OrderStatus) => Promise<ActionState> };

/** One button per valid next status. Cancelling asks first because it puts the stock back. */
export function StatusActions({ next, update }: Props) {
  const [error, setError] = useState<string>();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [pending, start] = useTransition();

  const run = (status: OrderStatus) =>
    start(async () => {
      setError(undefined);
      const result = await update(status);
      if (result.error) setError(result.error);
      setConfirmCancel(false);
    });

  if (next.length === 0) return <p className="text-sm text-muted-foreground">This order is final.</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {next.map((status) =>
          status === "cancelled" ? (
            <Button key={status} variant="outline" className="text-destructive" disabled={pending} onClick={() => setConfirmCancel(true)}>
              {LABELS[status]}
            </Button>
          ) : (
            <Button key={status} disabled={pending} onClick={() => run(status)}>
              {pending ? "Saving..." : LABELS[status]}
            </Button>
          ),
        )}
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>The items go back into stock. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>Keep order</Button>
            <Button variant="destructive" disabled={pending} onClick={() => run("cancelled")}>
              {pending ? "Cancelling..." : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
