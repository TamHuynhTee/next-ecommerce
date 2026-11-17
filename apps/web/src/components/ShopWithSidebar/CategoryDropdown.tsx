"use client";

import { useState } from "react";
import Link from "next/link";
import { buildShopHref, type ShopParams } from "@/lib/catalog/shop-params";
import type { Category } from "@/types/category";

const linkClass = (active: boolean) =>
  `block ease-out duration-200 hover:text-blue ${active ? "text-blue font-medium" : ""}`;

const CategoryDropdown = ({
  categories,
  basePath,
  params,
}: {
  categories: Category[];
  basePath: string;
  params: ShopParams;
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Category</p>
        <span
          aria-hidden
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          ⌄
        </span>
      </div>

      <div
        className={`flex-col gap-4 py-6 pl-6 pr-5.5 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        <Link
          href={buildShopHref(basePath, params, {
            category: null,
            sub: null,
          })}
          className={linkClass(!params.category && !params.sub)}
        >
          All products
        </Link>

        {categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-2">
            <Link
              href={buildShopHref(basePath, params, {
                category: category.slug,
                sub: null,
              })}
              className={linkClass(
                params.category === category.slug && !params.sub
              )}
            >
              {category.title}
            </Link>
            {category.subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={buildShopHref(basePath, params, {
                  category: category.slug,
                  sub: sub.slug,
                })}
                className={`pl-4 text-custom-sm ${linkClass(
                  params.sub === sub.slug
                )}`}
              >
                {sub.title}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
