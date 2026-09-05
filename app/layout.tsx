import type { Metadata, Viewport } from "next";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileBottomNav from "@/components/home/MobileBottomNav";
import { CartProvider } from "@/context/CartContext";
import AuthProvider from "@/components/AuthProvider";
import Analytics from "@/components/analytics/Analytics";
import PwaRegister from "@/components/PwaRegister";

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "ELANTRAA | Luxury Fashion & Bespoke Apparel",
    template: "%s | ELANTRAA",
  },
  description:
    "Discover the latest ELANTRAA catalogue, collections, and bespoke fashion services.",
  keywords: [
    "ELANTRAA",
    "Luxury Fashion",
    "Satin Dresses",
    "Ethnic Kurta Sets",
    "Designer Menswear",
    "Bespoke Apparel",
  ],
  metadataBase: new URL("https://elantraa.com"),
  openGraph: {
    title: "ELANTRAA | Luxury Fashion & Bespoke Apparel",
    description:
      "Explore ELANTRAA products, collections, and fashion services.",
    url: "https://elantraa.com",
    siteName: "ELANTRAA",
    images: [
      {
        url: "/images/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "ELANTRAA Luxury Collection Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ELANTRAA | Luxury Fashion",
    description: "Discover timeless elegance and luxury fashion at ELANTRAA.",
    images: ["/images/logo/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ELANTRAA Admin",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-body antialiased min-h-screen relative overflow-x-hidden max-w-full w-full pb-14 lg:pb-0">
        <AuthProvider>
          <CartProvider>
            <PwaRegister />
            <Analytics />
            <SplashScreen />
            {children}
            <WhatsAppButton />
            <MobileBottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
