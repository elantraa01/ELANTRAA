"use client";

import { Product } from "./mockData";
import ProductCard from "./ProductCard";

interface TrendingProductsProps {
  products?: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
}

export default function TrendingProducts({
  products,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}: TrendingProductsProps) {
  const displayProducts = products || [];

  if (displayProducts.length === 0) return null;

  return (
    <section id="trending" className="py-16 sm:py-24 bg-[#FAF8F5] relative border-t border-b border-[#C9A648]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 rounded-full mb-3 text-[10px] sm:text-xs font-medium uppercase tracking-widest">
              <span>🔥 SOCIAL PROOF</span>
              <span>•</span>
              <span>MOST COVETED</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 tracking-tight">
              Trending Silhouettes
            </h2>
            <p className="text-sm text-gray-600 font-light mt-2 max-w-lg font-sans">
              Handpicked pieces rapidly selling out across our global boutiques this season.
            </p>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">
              Real-Time Demand
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        {/* Product Cards Grid / Horizontal Scroll container */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {displayProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
