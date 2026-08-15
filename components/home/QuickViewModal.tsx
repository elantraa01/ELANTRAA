"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product } from "./mockData";
import SizeGuideModal from "@/components/product/SizeGuideModal";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: string, selectedColor: string, quantity: number) => void;
}

function QuickViewModalContent({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: string, selectedColor: string, quantity: number) => void;
}) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const selectedColor = "Default";
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    setSelectedSize(product.sizes[0] || "M");
    setQuantity(1);
    setActiveImage(product.images[0]);
  }, [product]);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden relative flex flex-col md:flex-row my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 text-gray-700 hover:bg-gray-100 transition-colors shadow"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Product Images */}
        <div className="md:w-1/2 relative bg-[#FAF8F5] p-6 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                onError={() => setActiveImage("")}
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs uppercase tracking-widest text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-20 relative rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? "border-[#C9A648] ring-2 ring-[#C9A648]/40 scale-105" : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Specifications & Action */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#C9A648] font-semibold mb-2">
              <span>
                {typeof product.category === "object"
                  ? (product.category as { name?: string })?.name || ""
                  : product.category}
              </span>
              <span className="text-emerald-600 font-medium">In Stock ({product.stock})</span>
            </div>

            <h2 className="text-2xl font-serif text-gray-900">{product.name}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 my-3">
              <span className="text-2xl font-semibold text-gray-900">
                ₹{(product.discountPrice || product.price).toLocaleString("en-IN")}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 font-light leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Size: <span className="text-[#C9A648]">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="text-[11px] text-[#C9A648] underline hover:text-gray-900 transition-colors font-medium"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 text-xs font-medium rounded border transition-all ${
                      selectedSize === size
                        ? "border-[#171717] bg-[#171717] text-[#D4AF37]"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleAdd}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white font-medium text-xs tracking-[0.2em] uppercase rounded shadow-lg hover:opacity-95 transition-opacity"
            >
              Add To Bag • ₹{((product.discountPrice || product.price) * quantity).toLocaleString("en-IN")}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        sizeChartImage={product.sizeChart}
        sizeChartCm={product.sizeChartCm}
        productName={product.name}
      />
    </div>
  );
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  if (!product) return null;
  return <QuickViewModalContent product={product} onClose={onClose} onAddToCart={onAddToCart} />;
}
