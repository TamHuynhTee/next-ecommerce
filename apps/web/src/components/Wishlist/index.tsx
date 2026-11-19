"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import Link from "next/link";
import SingleItem from "./SingleItem";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-thunks";
import type { AppDispatch } from "@/redux/store";

export const Wishlist = () => {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            {wishlistItems.length > 0 && (
              <button
                className="text-blue"
                onClick={() => dispatch(removeAllItemsFromWishlist())}
              >
                Clear Wishlist
              </button>
            )}
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-dark">Product</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-dark">Unit Price</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-dark">Stock Status</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-dark text-right">Action</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {wishlistItems.map((item) => (
                  <SingleItem item={item} key={item.id} />
                ))}
                {wishlistItems.length === 0 && (
                  <div className="border-t border-gray-3 py-12 px-10 text-center">
                    <p className="mb-5">Your wishlist is empty.</p>
                    <Link
                      href="/shop-without-sidebar"
                      className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Continue shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
