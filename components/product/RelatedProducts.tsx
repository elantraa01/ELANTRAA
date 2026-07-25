"use client";

import { useState, useEffect } from "react";
import { Product } from "@/components/home/mockData";
import ProductCard from "@/components/home/ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
}

export default function RelatedProducts({
  currentProductId,
  category,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}: RelatedProductsProps) {
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    async function loadRelated() {
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.products) {
            const filtered = (data.products as Product[]).filter((p) => p.id !== currentProductId).slice(0, 4);
            setRelated(filtered);
          }
        }
      } catch (err) {
        console.warn("Failed to load related products", err);
      }
    }
    if (category) loadRelated();
  }, [currentProductId, category]);

  if (related.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-white relative border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
            CURATED PAIRINGS
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 mt-1 tracking-tight">
            You May Also Like
          </h2>
          <div className="w-12 h-[2px] bg-[#C9A648] mx-auto mt-4" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {related.map((product) => (
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
