"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/home/Navbar";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import BrandStory from "@/components/home/BrandStory";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/home/Footer";
import QuickViewModal from "@/components/home/QuickViewModal";
import { Product } from "@/components/home/mockData";
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
          if (data.products) {
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

  const productsList = dbProducts;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white overflow-x-hidden w-full max-w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 px-5 py-3 rounded-lg shadow-2xl text-xs font-medium uppercase tracking-wider flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <span>&#10022;</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <Navbar />

      {/* Main Home Page Sections */}
      <main>
        <HeroBanner />
        <FeaturedCollections />
        <NewArrivals
          products={productsList.filter((p) => p.isNewArrival).slice(0, 4)}
          onQuickView={(p) => setSelectedProduct(p)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
        <BrandStory />
        <Newsletter />
      </main>

      {/* Footer */}
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
