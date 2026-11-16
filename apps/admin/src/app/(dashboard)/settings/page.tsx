import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PlaceholderPage title="Settings" description="Store and account preferences">
      <Card className="max-w-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <CardHeader>
          <CardTitle>Store profile</CardTitle>
          <CardDescription>Form placeholder, not connected to the API.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium">
              Store name
              <Input defaultValue="My Store" />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              Support email
              <Input type="email" defaultValue="support@example.com" />
            </label>
            <Button type="button">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </PlaceholderPage>
  );
}
