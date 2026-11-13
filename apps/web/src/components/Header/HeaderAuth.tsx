import { getOptionalUser } from "@/lib/auth/getCurrentUser";
import UserMenu from "./UserMenu";

/** Server component: reads the session at request time, so render it inside <Suspense>. */
export default async function HeaderAuth() {
  const user = await getOptionalUser();
  return <UserMenu user={user} />;
}
