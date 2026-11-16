import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { title: string; description: string; actionLabel?: string };

/** Shared shell for sections that are not implemented yet. */
export function PlaceholderPage({ title, description, actionLabel, children }: Props & { children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel ? <Button><Plus /> {actionLabel}</Button> : null}
      </div>
      {children ?? (
        <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <CardHeader>
            <CardTitle>Coming soon</CardTitle>
            <CardDescription>This section is a placeholder and will be wired to the API later.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">No data yet.</CardContent>
        </Card>
      )}
    </div>
  );
}
