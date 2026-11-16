"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { signInAction, type SignInState } from "./actions";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo ?? ""} />
      <label className="block space-y-1.5 text-sm font-medium">
        Email
        <Input name="email" type="email" defaultValue={state.email} autoComplete="email" required placeholder="admin@example.com" />
      </label>
      <label className="block space-y-1.5 text-sm font-medium">
        Password
        <Input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
