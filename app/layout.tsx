import type { Metadata } from "next";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "ELANTRAA | Luxury Fashion & Bespoke Apparel",
    template: "%s | ELANTRAA",
  },
  description:
    "Discover timeless elegance, Mulberry silk gowns, hand-embroidered kurta sets, and bespoke menswear at ELANTRAA.",
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
      "Handcrafted evening gowns, Mulberry silk sarees, and tailored menswear designed for timeless elegance.",
    url: "https://elantraa.com",
    siteName: "ELANTRAA",
    images: [
      {
        url: "/images/hero/hero_fashion.png",
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
    images: ["/images/hero/hero_fashion.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-body antialiased min-h-screen relative">
        <AuthProvider>
          <CartProvider>
            <SplashScreen />
            {children}
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


