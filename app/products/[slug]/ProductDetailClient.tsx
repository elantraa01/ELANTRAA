"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ReviewSection from "@/components/product/ReviewSection";
import RelatedProducts from "@/components/product/RelatedProducts";
import QuickViewModal from "@/components/home/QuickViewModal";
import { Product } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";

type ProductDetailClientProps = {
  product: Product;
};

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (
    p: Product,
    size?: string,
    color?: string,
    quantity: number = 1
  ) => {
    addItem(p, size, color, quantity);
    const sizeInfo = size ? ` (Size: ${size})` : "";
    showNotification(`Added ${p.name}${sizeInfo} to your shopping bag.`);
  };

  const handleToggleWishlist = (p: Product) => {
    showNotification(`Saved ${p.name} to your wishlist.`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white">
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 px-5 py-3 rounded-lg shadow-2xl text-xs font-medium uppercase tracking-wider flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <span>&#10022;</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar />

      <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs text-gray-500 uppercase tracking-wider sm:tracking-widest font-light overflow-x-auto whitespace-nowrap no-scrollbar">
            <Link href="/" className="hover:text-[#C9A648] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#C9A648] transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-[#C9A648] font-medium">{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo
            product={product}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
          />
        </div>
      </main>

      <ReviewSection productId={product.id} />

      <RelatedProducts
        currentProductId={product.id}
        category={product.category}
        onQuickView={(p) => setSelectedQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />

      <QuickViewModal
        product={selectedQuickViewProduct}
        onClose={() => setSelectedQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <Footer />
    </div>
  );
}
