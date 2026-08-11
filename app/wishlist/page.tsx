"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import QuickViewModal from "@/components/home/QuickViewModal";
import { Product } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist, addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    showNotification(`Added "${product.name}" to your shopping bag.`);
  };

  const handleRemoveFromWishlist = (product: Product) => {
    toggleWishlist(product);
    showNotification(`Removed "${product.name}" from your wishlist.`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 px-5 py-3 rounded-lg shadow-2xl text-xs font-medium uppercase tracking-wider flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
            <span>&#10022;</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">My Wishlist</span>
            </nav>
          </div>
        </div>

        {/* Wishlist Main Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
              SAVED PIECES
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mt-1 tracking-tight">
              My Wishlist ({wishlistItems.length})
            </h1>
            <div className="w-12 h-[2px] bg-[#C9A648] mx-auto mt-4" />
          </div>

          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {wishlistItems.map((product) => {
                const effectivePrice = product.discountPrice || product.price;
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Image & Remove Button */}
                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] uppercase tracking-widest text-gray-400">
                          No image
                        </div>
                      )}
                      
                      {/* Remove from wishlist button */}
                      <button
                        onClick={() => handleRemoveFromWishlist(product)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-600 hover:bg-white flex items-center justify-center shadow-md transition-all z-10"
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                      >
                        &times;
                      </button>

                      {/* Sale Badge */}
                      {product.discountPrice && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#C9A648] text-white text-[10px] font-bold uppercase tracking-wider rounded">
                          SALE
                        </span>
                      )}

                      {/* Quick View Trigger */}
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="absolute bottom-2 inset-x-2 py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-[11px] font-semibold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
                      >
                        Quick View
                      </button>
                    </div>

                    {/* Product Specs & Actions */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[10px] text-[#C9A648] font-bold uppercase tracking-wider block mb-1">
                          {typeof product.category === "object"
                            ? (product.category as { name?: string })?.name || ""
                            : product.category}
                        </span>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-sm font-serif text-gray-900 group-hover:text-[#C9A648] transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-sm font-bold text-gray-900 font-sans">
                            &#8377;{effectivePrice.toLocaleString("en-IN")}
                          </span>
                          {product.discountPrice && (
                            <span className="text-xs text-gray-400 line-through font-sans">
                              &#8377;{product.price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Move to Bag CTA */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="mt-4 w-full py-2.5 bg-[#171717] hover:bg-[#C9A648] text-[#D4AF37] hover:text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Move To Bag</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-[#FAF8F5] rounded-2xl p-10 text-center border border-gray-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-[#C9A648] text-2xl flex items-center justify-center mx-auto border border-amber-200">
                ❤️
              </div>
              <h2 className="text-xl font-serif text-gray-900">Your Wishlist is Empty</h2>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Save your favorite handcrafted silk gowns, sarees, and tailored silhouettes to keep track of items you love.
              </p>
              <Link
                href="/shop"
                className="inline-block px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white text-xs uppercase tracking-widest font-semibold rounded shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Explore Collection
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <Footer />
    </div>
  );
}
