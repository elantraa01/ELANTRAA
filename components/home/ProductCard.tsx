"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "./mockData";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useCart();
  const liked = isInWishlist(product.id);

  const initialImg = product.images && product.images[0] ? product.images[0] : "/images/collections/dresses.png";
  const [imgSrc, setImgSrc] = useState(initialImg);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between">
      {/* Product Image Box - Links to dedicated PDP */}
      <Link href={`/products/${product.slug}`} className="block relative w-full aspect-[3/4] bg-[#FAF8F5] overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          onError={() => setImgSrc("/images/collections/dresses.png")}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="px-2.5 py-1 bg-[#171717] text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase rounded">
              NEW
            </span>
          )}
          {product.discountPrice && (
            <span className="px-2.5 py-1 bg-[#C9A648] text-white text-[10px] font-bold tracking-widest uppercase rounded">
              SALE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-md ${
            liked
              ? "bg-red-50 text-red-500"
              : "bg-white/80 text-gray-600 hover:text-red-500 hover:bg-white"
          }`}
          aria-label="Toggle Wishlist"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1.5 sm:gap-2">
          {/* Desktop Quick View Modal Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="hidden sm:block flex-1 py-1.5 sm:py-2 px-2 sm:px-3 bg-white/95 text-gray-900 text-[10px] sm:text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#C9A648] hover:text-white transition-colors shadow-md text-center"
          >
            Quick View
          </button>

          {/* Mobile Direct Link to Product Page */}
          <span
            className="sm:hidden flex-1 py-1.5 px-2 bg-white/95 text-gray-900 text-[10px] uppercase tracking-wider font-semibold rounded shadow-md text-center"
          >
            View Details
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="py-1.5 sm:py-2 px-2.5 sm:px-3 bg-[#171717] text-[#D4AF37] text-[10px] sm:text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#C9A648] hover:text-white transition-colors shadow-md text-center shrink-0 z-20"
            aria-label="Add to Bag"
          >
            + Bag
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="uppercase tracking-wider text-[#C9A648] font-medium">
              {typeof product.category === "object"
                ? (product.category as { name?: string })?.name || "Couture"
                : product.category}
            </span>
            <div className="flex items-center text-amber-500">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 text-xs font-semibold text-gray-700">{product.rating}</span>
              <span className="text-gray-400 text-[10px] ml-0.5">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h4 className="text-sm font-serif text-gray-900 group-hover:text-[#C9A648] transition-colors line-clamp-1 cursor-pointer font-medium">
              {product.name}
            </h4>
          </Link>
        </div>

        {/* Price & Colors */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-900 font-sans">
              ₹{(product.discountPrice || product.price).toLocaleString("en-IN")}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through font-sans">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
