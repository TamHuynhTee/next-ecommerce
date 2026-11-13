import React, { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { UserProvider } from "@/context/UserContext";

async function Guard({
  redirectPath,
  children,
}: {
  redirectPath: string;
  children: React.ReactNode;
}) {
  // Awaiting here makes unauthenticated users redirect to /signin?redirect=<path>
  // before any protected UI is rendered.
  const userPromise = getCurrentUser(redirectPath);
  await userPromise;
  return <UserProvider userPromise={userPromise}>{children}</UserProvider>;
}

/**
 * Server-side HOC for pages that require an authenticated user.
 * The session is read behind a Suspense boundary so it never blocks the static shell.
 * The proxy does the optimistic check; this verifies the session with the API.
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  redirectPath: string,
  fallback: React.ReactNode = null,
) {
  const Protected = (props: P) => (
    <Suspense fallback={fallback}>
      <Guard redirectPath={redirectPath}>
        <Component {...props} />
      </Guard>
    </Suspense>
  );
  Protected.displayName = `withProtectedRoute(${
    Component.displayName || Component.name || "Component"
  })`;
  return Protected;
}

export default withProtectedRoute;
