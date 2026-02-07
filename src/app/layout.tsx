import type { Metadata } from "next";
import { Patrick_Hand, Quicksand, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { getCurrentSeason } from "@/config/themes";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  variable: "--font-patrick-hand",
});

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  variable: "--font-quicksand",
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nhà Kim Hương - Góc nhỏ tự tay làm quà",
  description:
    "Cửa hàng đồ thủ công, nguyên liệu DIY và quà tặng handmade ấm áp.",
};

import FallingPetals from "@/components/effects/FallingPetals";
import BottomNav from "./components/BottomNav";
// import TetWidget from "@/components/marketing/TetWidget";

import { Toaster } from 'sonner';
import { CartProvider } from "@/context/CartContext";
import NetworkMonitor from "./components/NetworkMonitor";
import SecurityShield from "./components/SecurityShield";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = getCurrentSeason();

  return (
    <html lang="vi">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body
        className={`${patrickHand.variable} ${quicksand.variable} ${beVietnamPro.variable} antialiased text-brand-brown font-body pb-20 md:pb-0 transition-colors duration-500`}
        style={
          {
            "--primary-theme": theme.colors.primary,
            "--sec-theme": theme.colors.secondary,
            "--btn-gradient": theme.colors.gradient,
            "--bg-overlay": theme.overlay !== "none" ? theme.overlay : "none",
            backgroundColor: "var(--sec-theme)",
          } as React.CSSProperties
        }
      >
        {theme.id === "TET" && <FallingPetals />}
        <Toaster position="top-center" richColors />

        <CartProvider>
          <SecurityShield />
          <NetworkMonitor />
          <div className="relative z-10">
            {children}
            <BottomNav />
            {/* <TetWidget /> */}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
