"use client";

import { useState } from "react";
import { Product } from "@/components/home/mockData";

interface ProductInfoProps {
  product: Product;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductInfo({
  product,
  onAddToCart,
  onToggleWishlist,
}: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "Default");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Accordion open states
  const [activeTab, setActiveTab] = useState<"details" | "materials" | "shipping" | "none">("details");

  const toggleTab = (tab: "details" | "materials" | "shipping") => {
    setActiveTab(activeTab === tab ? "none" : tab);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onToggleWishlist(product);
  };

  const effectivePrice = product.discountPrice || product.price;

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div>
        {/* Category & Ratings */}
        <div className="flex items-center justify-between text-xs uppercase tracking-widest mb-3">
          <span className="text-[#C9A648] font-bold">
            {typeof product.category === "object"
              ? (product.category as { name?: string })?.name || "Couture"
              : product.category}
          </span>
          <div className="flex items-center text-amber-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-xs font-semibold text-gray-800">{product.rating}</span>
            <a href="#reviews" className="ml-1 text-gray-400 hover:text-gray-600 underline">
              ({product.reviewCount} Reviews)
            </a>
          </div>
        </div>

        {/* Product Title */}
        <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 tracking-tight leading-tight">
          {product.name}
        </h1>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 my-4">
          <span className="text-2xl sm:text-3xl font-semibold text-gray-900 font-sans">
            &#8377;{effectivePrice.toLocaleString("en-IN")}
          </span>
          {product.discountPrice && (
            <span className="text-base text-gray-400 line-through font-sans">
              &#8377;{product.price.toLocaleString("en-IN")}
            </span>
          )}
          {product.discountPrice && (
            <span className="px-2.5 py-1 bg-[#C9A648]/15 text-[#C9A648] text-xs font-bold uppercase rounded">
              SAVE &#8377;{(product.price - product.discountPrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 font-light leading-relaxed mb-6 font-sans">
          {product.description}
        </p>

        {/* Color Variant Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-800 mb-2">
            Color: <span className="text-[#C9A648] font-bold">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md border text-xs font-medium transition-all ${
                    isSelected
                      ? "border-[#C9A648] bg-[#C9A648]/10 text-[#C9A648] ring-1 ring-[#C9A648]"
                      : "border-gray-200 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-inner"
                    style={{
                      backgroundColor:
                        color.toLowerCase() === "champagne"
                          ? "#F7E7CE"
                          : color.toLowerCase() === "gold"
                          ? "#D4AF37"
                          : color.toLowerCase() === "ivory" || color.toLowerCase() === "white"
                          ? "#FAFAFA"
                          : color.toLowerCase() === "olive"
                          ? "#556B2F"
                          : color.toLowerCase() === "sage"
                          ? "#9CAF88"
                          : "#222222",
                    }}
                  />
                  <span>{color}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selector */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-800">
              Select Size: <span className="text-[#C9A648] font-bold">{selectedSize}</span>
            </label>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-xs text-[#C9A648] underline hover:text-gray-900 font-medium"
            >
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[42px] sm:min-w-[44px] h-10 sm:h-11 px-3 text-xs font-semibold rounded-md border transition-all ${
                    isSelected
                      ? "border-[#171717] bg-[#171717] text-[#D4AF37] shadow"
                      : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Picker & Add to Bag (Mobile Stack & Desktop Row) */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 pt-2 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            {/* Quantity Controls */}
            <div className="inline-flex flex-1 sm:flex-initial items-center justify-between border border-gray-300 rounded-md p-1 bg-gray-50 sm:w-36">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 text-gray-600 hover:bg-white rounded font-bold text-lg flex items-center justify-center transition-colors"
              >
                -
              </button>
              <span className="font-semibold text-sm px-2 text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 text-gray-600 hover:bg-white rounded font-bold text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>

            {/* Wishlist Button (Mobile) */}
            <button
              onClick={handleWishlist}
              className={`p-3.5 rounded-md border transition-all flex items-center justify-center shadow-sm sm:hidden ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "bg-white border-gray-300 text-gray-600 hover:text-red-500 hover:border-red-300"
              }`}
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>

          {/* Add to Bag Main Button */}
          <button
            onClick={() => onAddToCart(product, selectedSize, selectedColor, quantity)}
            className="flex-1 py-3.5 sm:py-4 px-6 sm:px-8 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white font-medium text-xs sm:text-sm tracking-[0.2em] uppercase rounded-md shadow-lg hover:shadow-[#C9A648]/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Add To Bag • &#8377;{(effectivePrice * quantity).toLocaleString("en-IN")}</span>
          </button>

          {/* Wishlist Button (Desktop) */}
          <button
            onClick={handleWishlist}
            className={`hidden sm:flex p-4 rounded-md border transition-all items-center justify-center shadow-sm ${
              isWishlisted
                ? "bg-red-50 border-red-200 text-red-500"
                : "bg-white border-gray-300 text-gray-600 hover:text-red-500 hover:border-red-300"
            }`}
            aria-label="Wishlist"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Accordion Tabs */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        {/* Tab 1: Details */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleTab("details")}
            className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-gray-900 py-1 text-left"
          >
            <span>Design Details & Fit</span>
            <span>{activeTab === "details" ? "-" : "+"}</span>
          </button>
          {activeTab === "details" && (
            <ul className="mt-3 space-y-1.5 text-xs text-gray-600 font-light list-disc list-inside animate-in fade-in duration-200">
              {(product.details || [
                "Handcrafted luxury silhouette",
                "Designed for evening and formal couture occasions",
                "Bespoke tailored fit",
              ]).map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Tab 2: Materials & Care */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleTab("materials")}
            className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-gray-900 py-1 text-left"
          >
            <span>Fabric & Care Instructions</span>
            <span>{activeTab === "materials" ? "-" : "+"}</span>
          </button>
          {activeTab === "materials" && (
            <div className="mt-3 space-y-2 text-xs text-gray-600 font-light animate-in fade-in duration-200">
              <p><strong>Composition:</strong> {product.materials || "100% Pure Organic Mulberry Silk"}</p>
              <p><strong>Care:</strong> {product.careInstructions || "Dry clean only. Cool iron on reverse using press cloth."}</p>
            </div>
          )}
        </div>

        {/* Tab 3: Delivery */}
        <div className="border-b border-gray-200 pb-3">
          <button
            onClick={() => toggleTab("shipping")}
            className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-gray-900 py-1 text-left"
          >
            <span>Complimentary Shipping & Returns</span>
            <span>{activeTab === "shipping" ? "-" : "+"}</span>
          </button>
          {activeTab === "shipping" && (
            <div className="mt-3 space-y-2 text-xs text-gray-600 font-light animate-in fade-in duration-200">
              <p>✦ <strong>Express Delivery:</strong> 2-4 business days across India & worldwide.</p>
              <p>✦ <strong>Hassle-Free Returns:</strong> 15-day complimentary return & exchange window.</p>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900"
            >
              &times;
            </button>
            <h3 className="text-lg font-serif text-gray-900 mb-4 border-b pb-2">
              ELANTRAA Size Guide (Inches)
            </h3>
            <table className="w-full text-xs text-left text-gray-700 border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-900 font-semibold uppercase">
                  <th className="p-2">Size</th>
                  <th className="p-2">Bust</th>
                  <th className="p-2">Waist</th>
                  <th className="p-2">Hips</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-2 font-bold">XS</td><td className="p-2">32&quot;</td><td className="p-2">25&quot;</td><td className="p-2">35&quot;</td></tr>
                <tr><td className="p-2 font-bold">S</td><td className="p-2">34&quot;</td><td className="p-2">27&quot;</td><td className="p-2">37&quot;</td></tr>
                <tr><td className="p-2 font-bold">M</td><td className="p-2">36&quot;</td><td className="p-2">29&quot;</td><td className="p-2">39&quot;</td></tr>
                <tr><td className="p-2 font-bold">L</td><td className="p-2">38&quot;</td><td className="p-2">31&quot;</td><td className="p-2">41&quot;</td></tr>
                <tr><td className="p-2 font-bold">XL</td><td className="p-2">40&quot;</td><td className="p-2">33&quot;</td><td className="p-2">43&quot;</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Quick Buy Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-gray-200 shadow-2xl flex items-center justify-between gap-3 sm:hidden">
        <div>
          <span className="block text-sm font-bold text-gray-900 font-sans">
            &#8377;{(effectivePrice * quantity).toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-[#C9A648] uppercase tracking-wider font-semibold">
            Size: {selectedSize} • {selectedColor}
          </span>
        </div>
        <button
          onClick={() => onAddToCart(product, selectedSize, selectedColor, quantity)}
          className="py-2.5 px-5 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white text-xs uppercase tracking-widest font-semibold rounded shadow-md flex items-center space-x-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>+ Add To Bag</span>
        </button>
      </div>
    </div>
  );
}
