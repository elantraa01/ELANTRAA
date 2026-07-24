"use client";

import { useState } from "react";
import { MOCK_PRODUCTS, Product } from "./mockData";
import ProductCard from "./ProductCard";

interface NewArrivalsProps {
  products?: Product[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
}



export default function NewArrivals({
  products,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}: NewArrivalsProps) {
  const [activeTab, setActiveTab] = useState("All");
  const sourceProducts = products && products.length > 0 ? products : MOCK_PRODUCTS;

  // Extract unique category names from actual products dynamically
  const dynamicCategories = Array.from(
    new Set(
      sourceProducts.map((p) =>
        typeof p.category === "object"
          ? (p.category as { name?: string })?.name || "Couture"
          : p.category
      )
    )
  ).filter(Boolean);

  const categoryTabs = ["All", ...dynamicCategories];

  const filteredProducts = sourceProducts.filter((product) => {
    if (activeTab === "All") return true;
    const catName =
      typeof product.category === "object"
        ? (product.category as { name?: string })?.name || ""
        : product.category;
    return catName.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <section id="new-arrivals" className="py-16 sm:py-24 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
            AUTUMN / WINTER RELEASES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mt-2 tracking-tight">
            New Arrivals
          </h2>
          <p className="text-sm text-gray-600 font-light mt-2">
            Handcrafted luxury silhouettes designed for effortless sophistication.
          </p>
          <div className="w-12 h-[2px] bg-[#C9A648] mx-auto mt-4" />
        </div>

        {/* Category Tabs (Fixed Flexbox left-clipping bug on mobile) */}
        <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-4 mb-8 sm:mb-12 overflow-x-auto px-4 sm:px-0 pb-2 no-scrollbar w-full">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-5 py-2 text-xs uppercase tracking-widest rounded-full font-medium transition-all duration-300 whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? "bg-[#171717] text-[#D4AF37] shadow-md border border-[#C9A648]/40"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
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
