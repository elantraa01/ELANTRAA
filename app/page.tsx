"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/home/Navbar";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryTiles from "@/components/home/CategoryTiles";
import TrendingProducts from "@/components/home/TrendingProducts";
import NewArrivals from "@/components/home/NewArrivals";
import BrandStory from "@/components/home/BrandStory";
import EditorialCollection from "@/components/home/EditorialCollection";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/home/Footer";
import QuickViewModal from "@/components/home/QuickViewModal";
import { Product, MOCK_PRODUCTS } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setDbProducts(data.products);
          }
        }
      } catch (err) {
        console.warn("Failed to load DB products for Home", err);
      }
    }

    loadHomeProducts();
  }, []);

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
    addItem(product, size, color, quantity);
    const sizeInfo = size ? ` (Size: ${size})` : "";
    showNotification(`Added ${product.name}${sizeInfo} to your shopping bag.`);
  };

  const handleToggleWishlist = (product: Product) => {
    showNotification(`Saved ${product.name} to your wishlist.`);
  };

  // Combine DB products with MOCK_PRODUCTS fallback when no DB products exist
  const allProducts = dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;

  // Filter strictly by administrative flags so unchecking a flag instantly removes the product from the section
  const trendingProductsList = allProducts.filter((p) => Boolean(p.isFeatured) || Boolean(p.isBestSeller)).slice(0, 6);
  const newArrivalsList = allProducts.filter((p) => p.isNewArrival !== false).slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white overflow-x-hidden w-full max-w-full">
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

        {/* 5. Trending Products (4-6 cards with price + quick-add + social proof) */}
        <TrendingProducts
          products={trendingProductsList}
          onQuickView={(p) => setSelectedProduct(p)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* 6. New Arrivals (Same card format as Trending, filtered by newest, non-empty grid) */}
        <NewArrivals
          products={newArrivalsList.length > 0 ? newArrivalsList : MOCK_PRODUCTS.slice(0, 4)}
          onQuickView={(p) => setSelectedProduct(p)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* 7. Condensed Brand Story / Heritage Strip (1 image + quote + paragraph + 3 trust icons) */}
        <BrandStory />

        {/* 8. Featured/Editorial Collection Lookbook Banner ("The Mulberry Silk Edit") */}
        <EditorialCollection />

        {/* 9. Testimonials / Reviews (Star ratings, real names, avatars/photos) */}
        <Testimonials />

        {/* 10. Newsletter Privé Club (10% off hook) */}
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
