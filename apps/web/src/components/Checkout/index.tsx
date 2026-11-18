"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import Breadcrumb from "../Common/Breadcrumb";
import { useUser } from "@/context/UserContext";
import { getProfileAction, listAddressesAction } from "@/lib/account/actions";
import type { Address, Profile } from "@/lib/account/types";
import { getCartAction } from "@/lib/cart/actions";
import type { ServerCart } from "@/lib/cart/types";
import { formatPrice } from "@/lib/format";
import { createOrderAction } from "@/lib/orders/actions";
import type { CartIssue, CreateOrderInput } from "@/lib/orders/types";
import { setCart } from "@/redux/features/cart-slice";
import { toCartItems } from "@/redux/features/cart-thunks";
import type { AppDispatch } from "@/redux/store";

const inputClass =
  "rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "Your session has expired. Please sign in again.",
  CART_EMPTY: "Your cart is empty.",
  CART_INVALID: "Some items in your cart are no longer available.",
  UNAVAILABLE: "Could not place your order. Please try again.",
};

function Field({
  label,
  name,
  required = true,
  ...props
}: {
  label: string;
  name: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block mb-2.5">
        {label} {required && <span className="text-red">*</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        className={inputClass}
        {...props}
      />
    </div>
  );
}

function issueText(issue: CartIssue) {
  return issue.reason === "OUT_OF_STOCK"
    ? `${issue.title}: only ${issue.available} left`
    : `${issue.title}: no longer available`;
}

const Checkout = () => {
  const user = useUser();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [cart, setLocalCart] = useState<ServerCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [issues, setIssues] = useState<CartIssue[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  // Empty string means "enter a new address".
  const [selectedId, setSelectedId] = useState("");
  const selected = addresses.find((a) => a.id === selectedId) ?? null;

  const loadCart = async () => {
    const result = await getCartAction();
    if (result.ok === true) {
      setLocalCart(result.cart);
      dispatch(setCart({ items: toCartItems(result.cart), authenticated: true }));
    }
    setLoading(false);
  };

  useEffect(() => {
    // Saved details only prefill the form; failing to load them is harmless.
    Promise.all([getProfileAction(), listAddressesAction()]).then(
      ([profileResult, addressResult]) => {
        if (profileResult.ok === true) setProfile(profileResult.data);
        if (addressResult.ok === true) {
          setAddresses(addressResult.data);
          // The list is ordered by most recent, so the first one is the likeliest choice.
          setSelectedId(addressResult.data[0]?.id ?? "");
        }
      },
    );
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();

    const input: CreateOrderInput = {
      firstName: value("firstName"),
      lastName: value("lastName"),
      phone: value("phone"),
      email: value("email"),
      addressLine1: value("addressLine1"),
      addressLine2: value("addressLine2") || undefined,
      city: value("city"),
      postalCode: value("postalCode"),
      country: selected?.country,
    };

    setSubmitting(true);
    setIssues([]);
    const result = await createOrderAction(input);
    if (result.ok === true) {
      dispatch(setCart({ items: [], authenticated: true }));
      router.push(`/checkout/success/${result.data.id}`);
      return;
    }

    const failure = result as Extract<typeof result, { ok: false }>;
    if (failure.issues?.length) {
      setIssues(failure.issues);
      await loadCart();
    }
    toast.error(
      failure.details?.[0] ??
        ERROR_MESSAGES[failure.error] ??
        ERROR_MESSAGES.UNAVAILABLE,
    );
    setSubmitting(false);
  };

  const isEmpty = !loading && (!cart || cart.items.length === 0);

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {isEmpty ? (
            <div className="bg-white shadow-1 rounded-[10px] py-16 px-4 text-center">
              <p className="mb-6">Your cart is empty.</p>
              <Link
                href="/shop-without-sidebar"
                className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
                {/* Delivery details */}
                <div className="lg:max-w-[670px] w-full">
                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                    <h3 className="font-medium text-xl text-dark mb-5.5">
                      Delivery details
                    </h3>
                    {addresses.length > 0 && (
                      <div className="mb-5">
                        <label htmlFor="savedAddress" className="block mb-2.5">
                          Saved addresses
                        </label>
                        <select
                          id="savedAddress"
                          value={selectedId}
                          onChange={(e) => setSelectedId(e.target.value)}
                          className={inputClass}
                        >
                          {addresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.title} - {a.addressLine1}, {a.city}
                            </option>
                          ))}
                          <option value="">Use a new address</option>
                        </select>
                      </div>
                    )}
                    <div
                      key={`${selectedId}:${profile?.id ?? ""}`}
                      className="flex flex-col gap-5"
                    >
                      <div className="flex flex-col sm:flex-row gap-5">
                        <Field label="First name" name="firstName" maxLength={100} defaultValue={profile?.firstName ?? ""} autoComplete="given-name" />
                        <Field label="Last name" name="lastName" maxLength={100} defaultValue={profile?.lastName ?? ""} autoComplete="family-name" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-5">
                        <Field
                          label="Phone"
                          name="phone"
                          type="tel"
                          pattern="\+?[0-9]{9,11}"
                          title="9-11 digits"
                          defaultValue={selected?.phoneNumber ?? ""}
                          autoComplete="tel"
                        />
                        <Field
                          label="Email"
                          name="email"
                          type="email"
                          maxLength={100}
                          defaultValue={user.email}
                          autoComplete="email"
                        />
                      </div>
                      <Field label="Address" name="addressLine1" maxLength={500} placeholder="House number and street name" defaultValue={selected?.addressLine1 ?? ""} autoComplete="address-line1" />
                      <Field label="Apartment, suite, etc." name="addressLine2" required={false} maxLength={500} defaultValue={selected?.addressLine2 ?? ""} autoComplete="address-line2" />
                      <div className="flex flex-col sm:flex-row gap-5">
                        <Field label="City" name="city" maxLength={100} defaultValue={selected?.city ?? ""} autoComplete="address-level2" />
                        <Field label="Postal code" name="postalCode" maxLength={20} defaultValue={selected?.postalCode ?? ""} autoComplete="postal-code" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                    <h3 className="font-medium text-xl text-dark mb-3">
                      Payment method
                    </h3>
                    <p className="text-dark">Cash on delivery</p>
                    <p className="text-custom-sm mt-1">
                      Pay with cash when your order arrives.
                    </p>
                  </div>
                </div>

                {/* Order summary */}
                <div className="max-w-[455px] w-full">
                  <div className="bg-white shadow-1 rounded-[10px]">
                    <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                      <h3 className="font-medium text-xl text-dark">
                        Your Order
                      </h3>
                    </div>

                    <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                      {loading && <p className="py-5">Loading your cart…</p>}

                      {cart?.items.map((line) => (
                        <div
                          key={line.variantId}
                          className="flex items-center justify-between gap-4 py-5 border-b border-gray-3"
                        >
                          <p className="text-dark">
                            {line.title}{" "}
                            <span className="text-dark-4">× {line.quantity}</span>
                          </p>
                          <p className="text-dark text-right whitespace-nowrap">
                            {formatPrice(line.discountedPrice * line.quantity)}
                          </p>
                        </div>
                      ))}

                      {cart && (
                        <>
                          <div className="flex items-center justify-between py-5 border-b border-gray-3">
                            <p className="text-dark">Shipping fee</p>
                            <p className="text-dark text-right">
                              {cart.shippingFee === 0
                                ? "Free"
                                : formatPrice(cart.shippingFee)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-5">
                            <p className="font-medium text-lg text-dark">Total</p>
                            <p className="font-medium text-lg text-dark text-right">
                              {formatPrice(cart.total)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {issues.length > 0 && (
                    <div className="mt-7.5 rounded-md border border-red-light-4 bg-red-light-6 p-4 text-custom-sm text-red-dark">
                      <p className="font-medium mb-2">
                        Please review your cart:
                      </p>
                      <ul className="list-disc pl-5">
                        {issues.map((issue) => (
                          <li key={issue.variantId}>{issueText(issue)}</li>
                        ))}
                      </ul>
                      <Link href="/cart" className="underline mt-2 inline-block">
                        Back to cart
                      </Link>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || submitting || !cart?.items.length}
                    className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Placing order…" : "Place order"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default Checkout;
