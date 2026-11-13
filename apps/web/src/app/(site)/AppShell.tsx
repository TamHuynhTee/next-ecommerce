"use client";
import { Suspense, useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";

/**
 * Client-side app chrome. The session-dependent part of the header is a server
 * component passed in as `headerAuth`, so it can stream in behind Suspense.
 */
export default function AppShell({
  headerAuth,
  footer,
  children,
}: {
  headerAuth: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Always render the page tree: dropping `children` during the preloader hides the
  // route segment from Next.js instant-navigation validation. PreLoader is a fixed
  // full-screen overlay, so it simply covers the page while loading.
  return (
    <>
      {loading && <PreLoader />}
      <Toaster position="top-right" />
      <ReduxProvider>
        <CartModalProvider>
          <ModalProvider>
            <PreviewSliderProvider>
              <Header authSlot={headerAuth} />
              {children}

              <QuickViewModal />
              <CartSidebarModal />
              <Suspense><PreviewSliderModal /></Suspense>
            </PreviewSliderProvider>
          </ModalProvider>
        </CartModalProvider>
      </ReduxProvider>
      <ScrollToTop />
      {footer}
    </>
  );
}
