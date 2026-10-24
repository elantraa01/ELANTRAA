"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/home/Navbar";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryTiles from "@/components/home/CategoryTiles";
import TrendingProducts from "@/components/home/TrendingProducts";
import NewArrivals from "@/components/home/NewArrivals";
import BrandStory from "@/components/home/BrandStory";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/home/Footer";
import QuickViewModal from "@/components/home/QuickViewModal";
import ProductsComingSoon from "@/components/home/ProductsComingSoon";
import { HomeProductSectionSkeleton } from "@/components/ui/LuxurySkeleton";
import { Product } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";

let cachedHomeProducts: Product[] = [];

function getInitialProducts(): Product[] {
  if (cachedHomeProducts.length > 0) return cachedHomeProducts;
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("elantraa_home_products");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedHomeProducts = parsed;
          return parsed;
        }
      }
    } catch {}
  }
  return [];
}

export default function Home() {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>(getInitialProducts);
  const [loading, setLoading] = useState<boolean>(() => getInitialProducts().length === 0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            cachedHomeProducts = data.products;
            try {
              sessionStorage.setItem("elantraa_home_products", JSON.stringify(data.products));
            } catch {}
            setDbProducts(data.products);
          } else {
            setDbProducts([]);
          }
        }
      } catch (err) {
        console.warn("Failed to load DB products for Home", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeProducts();
  }, []);

  // Continuously record scroll position on the home page so going to any product remembers location
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        sessionStorage.setItem("elantraa_home_scroll", window.scrollY.toString());
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Restore exact previous scroll position on back navigation
  useEffect(() => {
    const saved = sessionStorage.getItem("elantraa_home_scroll");
    if (!saved) return;
    const targetY = parseInt(saved, 10);
    if (isNaN(targetY) || targetY <= 0) return;

    let cancelled = false;
    const restore = () => {
      if (!cancelled) {
        window.scrollTo({ top: targetY, behavior: "instant" });
      }
    };

    // Staggered restoration guarantees execution after layout and image layout sizing
    requestAnimationFrame(restore);
    const t1 = setTimeout(restore, 50);
    const t2 = setTimeout(restore, 150);
    const t3 = setTimeout(() => {
      restore();
      sessionStorage.removeItem("elantraa_home_scroll");
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (
    product: Product,
    size?: string,
    color?: string,
    quantity: number = 1
  ) => {
    const success = addItem(product, size, color, quantity);
    if (!success) return;
    const sizeInfo = size ? ` (Size: ${size})` : "";
    showNotification(`Added ${product.name}${sizeInfo} to your shopping bag.`);
  };

  const handleToggleWishlist = () => {
    // Notification will only show when user is logged in
  };

  // Filter strictly by administrative flags so unchecking a flag instantly removes the product from the section
  const trendingProductsList = dbProducts.filter((p) => Boolean(p.isFeatured) || Boolean(p.isBestSeller)).slice(0, 6);
  const newArrivalsList = dbProducts.filter((p) => p.isNewArrival !== false).slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white overflow-x-hidden w-full max-w-full [overflow-anchor:none]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 px-5 py-3 rounded-lg shadow-2xl text-xs font-medium uppercase tracking-wider flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <span>&#10022;</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1 & 2. Announcement Bar & Header/Nav */}
      <Navbar />

      {/* Main Home Page Sections strictly ordered */}
      <main>
        {/* 3. Hero Banner */}
        <HeroBanner />

        {/* 4. Category Tiles (3-4 clickable tiles: Women / Men / Accessories / Sale) */}
        <CategoryTiles />

        {/* While fetching products, display luxury ELANTRAA curation skeleton to prevent founder image jumping up */}
        {loading && <HomeProductSectionSkeleton />}

        {/* If no products are added from admin, display luxury Products Coming Soon section */}
        {!loading && dbProducts.length === 0 && <ProductsComingSoon />}

        {/* 5. Trending Products (4-6 cards with price + quick-add + social proof) */}
        {!loading && trendingProductsList.length > 0 && (
          <TrendingProducts
            products={trendingProductsList}
            onQuickView={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* 6. New Arrivals (Same card format as Trending, filtered by newest, non-empty grid) */}
        {!loading && newArrivalsList.length > 0 && (
          <NewArrivals
            products={newArrivalsList}
            onQuickView={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* 7. Condensed Brand Story / Heritage Strip (1 image + quote + paragraph + 3 trust icons) */}
        <BrandStory />

        {/* 10. Newsletter Section (10% off hook) */}
        <Newsletter />
      </main>

      {/* 11. Footer (Collections, Concierge, Legal minus Admin Portal, payment icons, social links) */}
      <Footer />

      {/* Interactive Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
