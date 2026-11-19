import { connection } from "next/server";

import { cartRequest } from "@/lib/cart/api";
import { wishlistRequest } from "@/lib/wishlist/api";
import CartSync from "./CartSync";
import WishlistSync from "./WishlistSync";

/**
 * Server component: loads the signed-in user's cart and wishlist so the
 * client state starts from the server. Reads the session, so render it inside
 * <Suspense>. Guests get null and keep their local state.
 */
export default async function CartHydrator() {
  // The session check reads the clock, which Next forbids while prerendering;
  // wait for a real request instead.
  await connection();
  const [cart, wishlist] = await Promise.all([
    cartRequest("GET", ""),
    wishlistRequest("GET", ""),
  ]);
  return (
    <>
      <CartSync cart={cart.ok ? cart.cart : null} />
      <WishlistSync wishlist={wishlist.ok ? wishlist.wishlist : null} />
    </>
  );
}
