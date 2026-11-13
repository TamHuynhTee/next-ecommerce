"use client";
import { createContext, use } from "react";
import type { ReactNode } from "react";
import type { User } from "@/lib/auth/getCurrentUser";

const UserContext = createContext<Promise<User> | null>(null);

export function UserProvider({
  userPromise,
  children,
}: {
  userPromise: Promise<User>;
  children: ReactNode;
}) {
  return <UserContext value={userPromise}>{children}</UserContext>;
}

/** Suspends until the user resolves; use behind a <Suspense> boundary. */
export function useUser() {
  const userPromise = use(UserContext);
  if (!userPromise) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return use(userPromise);
}
