import { Suspense } from "react";
import { Be_Vietnam_Pro } from "next/font/google";
import "../css/style.css";
import AppShell from "./AppShell";
import HeaderAuth from "@/components/Header/HeaderAuth";
import Footer from "@/components/Footer";
import CartHydrator from "@/components/Common/CartHydrator";
import UserMenu from "@/components/Header/UserMenu";

// Designed for Vietnamese, so stacked diacritics render cleanly next to Latin text.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={beVietnamPro.variable}
      suppressHydrationWarning={true}
    >
      <body>
        <AppShell
          footer={<Footer />}
          cartSlot={
            // Loads the signed-in user's cart; guests keep their local cart.
            <Suspense fallback={null}>
              <CartHydrator />
            </Suspense>
          }
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
