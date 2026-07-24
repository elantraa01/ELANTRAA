"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProducts from "@/components/product/RelatedProducts";
import QuickViewModal from "@/components/home/QuickViewModal";
import { MOCK_PRODUCTS, Product } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProductData() {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.product) {
            setProduct(data.product);
          } else {
            const fallback = MOCK_PRODUCTS.find((p) => p.slug === params.slug) || MOCK_PRODUCTS[0];
            setProduct(fallback);
          }
        } else {
          const fallback = MOCK_PRODUCTS.find((p) => p.slug === params.slug) || MOCK_PRODUCTS[0];
          setProduct(fallback);
        }
      } catch {
        const fallback = MOCK_PRODUCTS.find((p) => p.slug === params.slug) || MOCK_PRODUCTS[0];
        setProduct(fallback);
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
  }, [params.slug]);

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

  const activeProduct = product || MOCK_PRODUCTS[0];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 px-5 py-3 rounded-lg shadow-2xl text-xs font-medium uppercase tracking-wider flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <span>&#10022;</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <Navbar />

      {/* Breadcrumb Navigation */}
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
            <span className="text-[#C9A648] font-medium">{activeProduct.category}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
              {activeProduct.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main PDP Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 animate-pulse">
            <div className="h-[500px] bg-gray-100 rounded-2xl" />
            <div className="space-y-6">
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-6 bg-gray-100 rounded w-1/4" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left Column: Image Gallery */}
            <ProductGallery images={activeProduct.images} productName={activeProduct.name} />

            {/* Right Column: Product Specs & CTAs */}
            <ProductInfo
              product={activeProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>
        )}
      </main>

      {/* Customer Reviews & Ratings Section */}
      <ProductReviews
        productId={activeProduct.id}
        rating={activeProduct.rating}
        reviewCount={activeProduct.reviewCount}
      />

      {/* "You May Also Like" Related Products */}
      <RelatedProducts
        currentProductId={activeProduct.id}
        category={activeProduct.category}
        onQuickView={(p) => setSelectedQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Quick View Modal for Related Products */}
      <QuickViewModal
        product={selectedQuickViewProduct}
        onClose={() => setSelectedQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
