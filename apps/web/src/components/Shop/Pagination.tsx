import Link from "next/link";
import { buildShopHref, type ShopParams } from "@/lib/catalog/shop-params";

const itemClass =
  "flex py-1.5 px-3.5 duration-200 rounded-[3px] hover:text-white hover:bg-blue";

/** Page numbers around the current page, with "..." gaps: 1 ... 4 5 6 ... 10. */
function pagesToShow(page: number, totalPages: number) {
  const sorted = Array.from(new Set([1, totalPages, page - 1, page, page + 1]))
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

const Pagination = ({
  basePath,
  params,
  page,
  total,
  limit,
}: {
  basePath: string;
  params: ShopParams;
  page: number;
  total: number;
  limit: number;
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;
  const href = (p: number) => buildShopHref(basePath, params, { page: p });

  return (
    <div className="flex justify-center mt-15">
      <div className="bg-white shadow-1 rounded-md p-2">
        <ul className="flex items-center">
          <li>
            {page > 1 ? (
              <Link
                href={href(page - 1)}
                aria-label="Previous page"
                className="flex items-center justify-center w-8 h-9 hover:text-blue"
              >
                ‹
              </Link>
            ) : (
              <span className="flex items-center justify-center w-8 h-9 text-gray-4">
                ‹
              </span>
            )}
          </li>

          {pagesToShow(page, totalPages).map((p, i) => (
            <li key={`${p}-${i}`}>
              {p === "gap" ? (
                <span className="flex py-1.5 px-3.5">...</span>
              ) : (
                <Link
                  href={href(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={
                    p === page
                      ? "flex py-1.5 px-3.5 duration-200 rounded-[3px] bg-blue text-white"
                      : itemClass
                  }
                >
                  {p}
                </Link>
              )}
            </li>
          ))}

          <li>
            {page < totalPages ? (
              <Link
                href={href(page + 1)}
                aria-label="Next page"
                className="flex items-center justify-center w-8 h-9 hover:text-blue"
              >
                ›
              </Link>
            ) : (
              <span className="flex items-center justify-center w-8 h-9 text-gray-4">
                ›
              </span>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Pagination;
