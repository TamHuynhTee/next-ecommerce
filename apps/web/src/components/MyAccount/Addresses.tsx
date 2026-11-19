"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createAddressAction,
  deleteAddressAction,
  listAddressesAction,
  updateAddressAction,
} from "@/lib/account/actions";
import type { Address, AddressInput } from "@/lib/account/types";

const inputClass =
  "rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const ERRORS: Record<string, string> = {
  ADDRESS_LIMIT_REACHED: "You can save up to 10 addresses.",
  UNAUTHENTICATED: "Your session has expired. Please sign in again.",
};

function AddressForm({
  address,
  saving,
  onSubmit,
  onCancel,
}: {
  address: Address | null;
  saving: boolean;
  onSubmit: (input: AddressInput) => void;
  onCancel: () => void;
}) {
  const handle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    onSubmit({
      title: value("title"),
      addressLine1: value("addressLine1"),
      addressLine2: value("addressLine2") || undefined,
      city: value("city"),
      postalCode: value("postalCode"),
      phoneNumber: value("phoneNumber"),
    });
  };

  const field = (
    name: keyof AddressInput,
    label: string,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {},
    required = true,
  ) => (
    <div className="w-full">
      <label htmlFor={`addr-${name}`} className="block mb-2.5">
        {label} {required && <span className="text-red">*</span>}
      </label>
      <input
        id={`addr-${name}`}
        name={name}
        required={required}
        defaultValue={address?.[name] ?? ""}
        className={inputClass}
        {...extra}
      />
    </div>
  );

  return (
    <form onSubmit={handle} className="flex flex-col gap-5">
      {field("title", "Label", { placeholder: "Home, Office...", maxLength: 100 })}
      {field("addressLine1", "Address", { maxLength: 500 })}
      {field("addressLine2", "Apartment, suite, etc.", { maxLength: 500 }, false)}
      <div className="flex flex-col sm:flex-row gap-5">
        {field("city", "City", { maxLength: 100 })}
        {field("postalCode", "Postal code", { maxLength: 20 })}
      </div>
      {field("phoneNumber", "Phone", {
        type: "tel",
        pattern: "\\+?[0-9]{9,11}",
        title: "9-11 digits",
      })}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex font-medium text-dark bg-gray-1 border border-gray-3 py-3 px-6 rounded-md ease-out duration-200 hover:bg-gray-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [failed, setFailed] = useState(false);
  // undefined: list view, null: new address form, Address: editing it.
  const [editing, setEditing] = useState<Address | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const result = await listAddressesAction();
    if (result.ok === true) setAddresses(result.data);
    else setFailed(true);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (input: AddressInput) => {
    setSaving(true);
    const result = editing
      ? await updateAddressAction(editing.id, input)
      : await createAddressAction(input);
    setSaving(false);
    if (result.ok === true) {
      toast.success("Address saved");
      setEditing(undefined);
      await load();
      return;
    }
    const failure = result as Extract<typeof result, { ok: false }>;
    toast.error(
      failure.details?.[0] ?? ERRORS[failure.error] ?? "Could not save the address.",
    );
  };

  const remove = async (id: string) => {
    const result = await deleteAddressAction(id);
    if (result.ok === true) {
      setAddresses((current) => current?.filter((a) => a.id !== id) ?? current);
    } else {
      toast.error("Could not delete the address.");
    }
  };

  if (failed) return <p>Could not load your addresses. Please try again later.</p>;
  if (!addresses) return <p>Loading…</p>;

  if (editing !== undefined) {
    return (
      <div className="bg-white shadow-1 rounded-xl p-4 sm:p-7.5">
        <h3 className="font-medium text-xl text-dark mb-5.5">
          {editing ? "Edit address" : "New address"}
        </h3>
        <AddressForm
          key={editing?.id ?? "new"}
          address={editing}
          saving={saving}
          onSubmit={save}
          onCancel={() => setEditing(undefined)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {addresses.length === 0 && (
        <p className="bg-white shadow-1 rounded-xl p-4 sm:p-7.5">
          You have no saved addresses yet.
        </p>
      )}
      {addresses.map((address) => (
        <div
          key={address.id}
          className="bg-white shadow-1 rounded-xl p-4 sm:p-7.5 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="text-custom-sm">
            <p className="font-medium text-dark mb-1">{address.title}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {address.city} {address.postalCode}
            </p>
            <p>{address.phoneNumber}</p>
          </div>
          <div className="flex gap-4 text-custom-sm">
            <button className="text-blue hover:underline" onClick={() => setEditing(address)}>
              Edit
            </button>
            <button className="text-red hover:underline" onClick={() => remove(address.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
      <div>
        <button
          onClick={() => setEditing(null)}
          className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
        >
          Add address
        </button>
      </div>
    </div>
  );
};

export default Addresses;
