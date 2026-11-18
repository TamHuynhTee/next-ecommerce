import { cartRequest } from "@/lib/cart/api";
import CartSync from "./CartSync";

/** Server component: reads the session, so render it inside <Suspense>. */
export default async function CartHydrator() {
  const result = await cartRequest("GET", "");
  return <CartSync cart={result.ok ? result.cart : null} />;
}
