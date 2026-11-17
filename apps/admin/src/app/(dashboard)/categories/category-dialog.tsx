"use client";

import { Pencil, Plus } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState, Category, SubCategory } from "@/lib/api/types";
import { slugify } from "@/lib/slugify";

import { saveCategoryAction } from "./actions";

type Props = { kind: "category"; item?: Category } | { kind: "sub"; parentId: string; item?: SubCategory };

export function CategoryDialog(props: Props) {
  const item = props.item;
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(saveCategoryAction, {});
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [touched, setTouched] = useState(!!item);
  // Controlled so React 19's post-action form reset does not wipe them after a failed save.
  const [description, setDescription] = useState(item?.description ?? "");
  const [status, setStatus] = useState<string>(props.kind === "category" ? (props.item?.status ?? "active") : "active");

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  const noun = props.kind === "category" ? "category" : "sub-category";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {item ? (
          <Button variant="ghost" size="sm"><Pencil /> Edit</Button>
        ) : (
          <Button variant={props.kind === "category" ? "default" : "outline"} size="sm">
            <Plus /> Add {noun}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit" : "New"} {noun}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="kind" value={props.kind} />
          <input type="hidden" name="id" value={item?.id ?? ""} />
          {props.kind === "sub" ? <input type="hidden" name="parentId" value={props.parentId} /> : null}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!touched) setSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" required value={slug} onChange={(e) => { setTouched(true); setSlug(e.target.value); }} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {props.kind === "category" ? (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <input type="hidden" name="status" value={status} />
              <Select value={status} onValueChange={(v) => { if (v) setStatus(v); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" disabled={pending} className="w-full">{pending ? "Saving..." : "Save"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
