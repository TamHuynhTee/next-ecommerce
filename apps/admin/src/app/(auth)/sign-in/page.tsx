import { Gem } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Gem className="size-7 text-primary" /> Backoffice
        </div>
        <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Use an administrator account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm redirectTo={redirect} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
