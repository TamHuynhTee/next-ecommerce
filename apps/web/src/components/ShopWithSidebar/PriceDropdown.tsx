"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildShopHref, type ShopParams } from "@/lib/catalog/shop-params";

const PriceDropdown = ({
  basePath,
  params,
}: {
  basePath: string;
  params: ShopParams;
}) => {
  const router = useRouter();
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [min, setMin] = useState(params.minPrice ?? "");
  const [max, setMax] = useState(params.maxPrice ?? "");

  const apply = () =>
    router.push(
      buildShopHref(basePath, params, {
        minPrice: min.trim(),
        maxPrice: max.trim(),
      })
    );

  const inputClass =
    "w-full rounded-md border border-gray-3 py-2 px-3 text-custom-sm outline-none focus:border-blue";

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Price (₫)</p>
        <span
          aria-hidden
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          ⌄
        </span>
      </div>

      <div className={`${toggleDropdown ? "block" : "hidden"} p-6`}>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="From"
            aria-label="Minimum price"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className={inputClass}
          />
          <span>–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="To"
            aria-label="Maximum price"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={apply}
          className="mt-4 inline-flex font-medium text-custom-sm text-white bg-blue py-2 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default PriceDropdown;
