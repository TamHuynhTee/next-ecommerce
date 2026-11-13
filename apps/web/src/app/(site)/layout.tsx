import { Suspense } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import AppShell from "./AppShell";
import HeaderAuth from "@/components/Header/HeaderAuth";
import Footer from "@/components/Footer";
import UserMenu from "@/components/Header/UserMenu";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <AppShell
          footer={<Footer />}
          headerAuth={
            // Guest UI is part of the static shell; the real user streams in.
            <Suspense fallback={<UserMenu user={null} />}>
              <HeaderAuth />
            </Suspense>
          }
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
