"use client";
import React, { ReactNode, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import Breadcrumb from "../Common/Breadcrumb";
import Newsletter from "../Common/Newsletter";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { addItemToCart } from "@/redux/features/cart-thunks";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch } from "@/redux/store";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

const unique = (values: (string | null)[]) =>
  Array.from(new Set(values.filter((v): v is string => !!v)));

const optionClass = (active: boolean) =>
  `cursor-pointer select-none rounded-md border py-1.5 px-4 text-custom-sm ease-out duration-200 ${
    active
      ? "border-blue bg-blue text-white"
      : "border-gray-4 text-dark hover:border-blue hover:text-blue"
  }`;

const ShopDetails = ({
  product,
  related,
}: {
  product: Product;
  /** Server-rendered "related products" section. */
  related?: ReactNode;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();
  const { openCartModal } = useCartModalContext();

  const variants = product.variants ?? [];
  const [selectedId, setSelectedId] = useState(product.variantId);
  const variant = variants.find((v) => v.id === selectedId) ?? variants[0];

  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const colors = unique(variants.map((v) => v.color));
  const sizes = unique(variants.map((v) => v.size));

  const select = (color: string | null, size: string | null) => {
    const match =
      variants.find(
        (v) => (!color || v.color === color) && (!size || v.size === size)
      ) ??
      variants.find((v) => !color || v.color === color) ??
      variants.find((v) => !size || v.size === size);
    if (!match) return;
    setSelectedId(match.id);
    setQuantity(1);
    const imageIndex = match.image
      ? product.imgs.previews.indexOf(match.image)
      : -1;
    if (imageIndex >= 0) setPreviewImg(imageIndex);
  };

  const price = variant?.price ?? product.discountedPrice;
  const originalPrice = variant?.originalPrice ?? product.price;
  const discount =
    originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;
  const inStock = !variant || variant.stock > 0;
  const maxQuantity = variant?.stock ?? 99;

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        id: variant?.id ?? product.id,
        title: product.title,
        price: originalPrice,
        discountedPrice: price,
        quantity,
        imgs: product.imgs,
      })
    );
    toast.success("Added to cart");
    openCartModal();
  };

  const handleAddToWishlist = () => {
    dispatch(
      addItemToWishlist({
        id: variant?.id ?? product.id,
        title: product.title,
        price: originalPrice,
        discountedPrice: price,
        quantity: 1,
        status: inStock ? "available" : "out of stock",
        imgs: product.imgs,
      })
    );
    toast.success("Added to wishlist");
  };

  const handlePreviewSlider = () => {
    // The zoom modal reads the product from the store.
    dispatch(updateproductDetails(product));
    openPreviewModal();
  };

  const tabs = [
    { id: "description", title: "Description" },
    { id: "info", title: "Additional Information" },
  ];

  const info = [
    ["SKU", variant?.sku],
    ["Category", product.categoryName],
    ["Color", variant?.color],
    ["Size", variant?.size],
  ].filter((row): row is [string, string] => !!row[1]);

  return (
    <>
      <Breadcrumb title={"Shop Details"} pages={["shop details"]} />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                <button
                  onClick={handlePreviewSlider}
                  aria-label="button for zoom"
                  className="gallery__Image w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8V3a1 1 0 0 1 1-1h5M14 2h5a1 1 0 0 1 1 1v5M20 14v5a1 1 0 0 1-1 1h-5M8 20H3a1 1 0 0 1-1-1v-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                <Image
                  src={product.imgs.previews[previewImg]}
                  alt={product.title}
                  width={400}
                  height={400}
                  priority
                />
              </div>

              {product.imgs.thumbnails.length > 1 && (
                <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                  {product.imgs.thumbnails.map((item, key) => (
                    <button
                      onClick={() => setPreviewImg(key)}
                      key={key}
                      className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                        key === previewImg
                          ? "border-blue"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        width={50}
                        height={50}
                        src={item}
                        alt="thumbnail"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* <!-- product content --> */}
            <div className="max-w-[539px] w-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                  {product.title}
                </h2>

                {discount > 0 && (
                  <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                    {discount}% OFF
                  </div>
                )}
              </div>

              <div
                className={`mb-4.5 font-medium ${
                  inStock ? "text-green" : "text-red"
                }`}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </div>

              <h3 className="font-medium text-custom-1 mb-4.5">
                <span className="text-sm sm:text-base text-dark">
                  {formatPrice(price)}
                </span>
                {discount > 0 && (
                  <span className="line-through ml-3 text-dark-4">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </h3>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                  {colors.length > 0 && (
                    <div className="flex items-center gap-4">
                      <h4 className="min-w-[65px] font-medium text-dark">
                        Color:
                      </h4>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {colors.map((color) => (
                          <button
                            type="button"
                            key={color}
                            onClick={() => select(color, variant?.size ?? null)}
                            className={optionClass(variant?.color === color)}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sizes.length > 0 && (
                    <div className="flex items-center gap-4">
                      <h4 className="min-w-[65px] font-medium text-dark">
                        Size:
                      </h4>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {sizes.map((size) => (
                          <button
                            type="button"
                            key={size}
                            onClick={() => select(variant?.color ?? null, size)}
                            className={optionClass(variant?.size === size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4.5">
                  <div className="flex items-center rounded-md border border-gray-3">
                    <button
                      type="button"
                      aria-label="button for remove product"
                      className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    >
                      −
                    </button>

                    <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      aria-label="button for add product"
                      className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                      onClick={() =>
                        quantity < maxQuantity && setQuantity(quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={handleAddToCart}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToWishlist}
                    aria-label="Add to wishlist"
                    className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-3 ease-out duration-200 hover:text-white hover:bg-dark hover:border-transparent"
                  >
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 20.5 4.6 13.3a4.7 4.7 0 0 1 6.6-6.7l.8.8.8-.8a4.7 4.7 0 0 1 6.6 6.7L12 20.5Zm0-2.1 6.2-6a3.2 3.2 0 0 0-4.5-4.6L12 9.4 10.3 7.8a3.2 3.2 0 0 0-4.5 4.6l6.2 6Z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${
                  activeTab === item.id
                    ? "text-blue before:w-full"
                    : "text-dark before:w-0"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-10">
              <p className="whitespace-pre-line">
                {product.description || "No description yet."}
              </p>
            </div>
          )}

          {activeTab === "info" && (
            <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-10">
              {info.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5"
                >
                  <div className="max-w-[450px] min-w-[140px] w-full">
                    <p className="text-sm sm:text-base text-dark">{label}</p>
                  </div>
                  <div className="w-full">
                    <p className="text-sm sm:text-base text-dark">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {related}

      <Newsletter />
    </>
  );
};

export default ShopDetails;
