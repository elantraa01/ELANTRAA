"use client";

import { Product } from "./mockData";
import ProductCard from "./ProductCard";

interface BestSellersProps {
  products?: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
}

export default function BestSellers({
  products,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}: BestSellersProps) {
  const bestSellers = products || [];

  return (
    <section id="best-sellers" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <div>
            <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
              MOST COVETED PIECES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mt-2 tracking-tight">
              Best Sellers
            </h2>
          </div>
          <p className="text-sm text-gray-500 font-light max-w-md mt-4 md:mt-0">
            Timeless staples loved by our clientele worldwide for their unmatched quality and design.
          </p>
        </div>

        {/* Best Sellers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {bestSellers.map((product) => (
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
