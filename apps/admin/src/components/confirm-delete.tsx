"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ActionState } from "@/lib/api/types";

type Props = { title: string; description: string; action: () => Promise<ActionState>; label?: string };

/** Delete button with a confirmation dialog; shows the API error if the delete is rejected. */
export function ConfirmDelete({ title, description, action, label = "Delete" }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const confirm = () =>
    start(async () => {
      const result = await action();
      if (result.error) setError(result.error);
      else setOpen(false);
    });

  return (
    <>
      <Button variant="ghost" size="sm" className="text-destructive" aria-label={label ? undefined : "Delete"} onClick={() => { setError(undefined); setOpen(true); }}>
        <Trash2 /> {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirm} disabled={pending}>{pending ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
