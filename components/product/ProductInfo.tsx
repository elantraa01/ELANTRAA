"use client";

import { useState } from "react";
import { Product } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";
import SizeGuideModal from "./SizeGuideModal";

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
  const { toggleWishlist, isInWishlist } = useCart();
  const isWishlisted = isInWishlist(product.id);

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const selectedColor = "Default";
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Accordion open states
  const [activeTab, setActiveTab] = useState<"productInfo" | "delivery" | "disclaimer" | "additionalInfo" | "none">("none");

  const toggleTab = (tab: "productInfo" | "delivery" | "disclaimer" | "additionalInfo") => {
    setActiveTab(activeTab === tab ? "none" : tab);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
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
              ? (product.category as { name?: string })?.name || ""
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
                  className={`min-w-[42px] sm:min-w-[44px] h-10 sm:h-11 px-3 text-xs font-semibold rounded-md border transition-all ${isSelected
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
              className={`p-3.5 rounded-md border transition-all flex items-center justify-center shadow-sm sm:hidden ${isWishlisted
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
            className={`hidden sm:flex p-4 rounded-md border transition-all items-center justify-center shadow-sm ${isWishlisted
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

        {/* Inquire About Customization Button */}
        <button
          type="button"
          onClick={() => {
            const text = encodeURIComponent(`Hi ELANTRAA team, I would like to inquire about customization for "${product.name}".`);
            window.open(`https://wa.me/919015342951?text=${text}`, "_blank");
          }}
          className="w-full py-3.5 px-4 border border-gray-900 text-gray-900 font-semibold text-xs uppercase tracking-[0.15em] hover:bg-gray-900 hover:text-white transition-all duration-200 mb-6 rounded-none"
        >
          Inquire about customization
        </button>
      </div>

      {/* Accordion Tabs */}
      <div className="border-t border-gray-200 space-y-0">
        {/* Tab 1: Product Information */}
        <div className="border-b border-gray-200 py-4">
          <button
            onClick={() => toggleTab("productInfo")}
            className="w-full flex items-center justify-between text-sm sm:text-base font-normal text-gray-900 text-left tracking-wide"
          >
            <span>Product Information</span>
            <svg
              className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${activeTab === "productInfo" ? "rotate-90 text-gray-900" : ""
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {activeTab === "productInfo" && (
            <div className="mt-3 text-xs sm:text-sm text-gray-600 font-light leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
              {product.productInformation || product.description || "Handcrafted luxury garment with bespoke tailoring, intricate embroidery details, and elegant silhouette."}
            </div>
          )}
        </div>

        {/* Tab 2: Delivery Timelines */}
        <div className="border-b border-gray-200 py-4">
          <button
            onClick={() => toggleTab("delivery")}
            className="w-full flex items-center justify-between text-sm sm:text-base font-normal text-gray-900 text-left tracking-wide"
          >
            <span>Delivery Timelines</span>
            <svg
              className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${activeTab === "delivery" ? "rotate-90 text-gray-900" : ""
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {activeTab === "delivery" && (
            <div className="mt-3 text-xs sm:text-sm text-gray-600 font-light leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
              {product.deliveryTimelines || "Standard Shipping: Delivered within 3-5 business days across India.\nExpress Shipping: 2 business days.\nInternational Orders: 5-7 business days via global courier partners."}
            </div>
          )}
        </div>

        {/* Tab 3: Disclaimer */}
        <div className="border-b border-gray-200 py-4">
          <button
            onClick={() => toggleTab("disclaimer")}
            className="w-full flex items-center justify-between text-sm sm:text-base font-normal text-gray-900 text-left tracking-wide"
          >
            <span>Disclaimer</span>
            <svg
              className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${activeTab === "disclaimer" ? "rotate-90 text-gray-900" : ""
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {activeTab === "disclaimer" && (
            <div className="mt-3 text-xs sm:text-sm text-gray-600 font-light leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
              {product.disclaimer || "Colors of the product may slightly vary due to studio lighting sources or display screen resolutions. Handcrafted garments may feature subtle variations in embroidery and weave."}
            </div>
          )}
        </div>

        {/* Tab 4: Additional Information */}
        <div className="border-b border-gray-200 py-4">
          <button
            onClick={() => toggleTab("additionalInfo")}
            className="w-full flex items-center justify-between text-sm sm:text-base font-normal text-gray-900 text-left tracking-wide"
          >
            <span>Additional Information</span>
            <svg
              className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${activeTab === "additionalInfo" ? "rotate-90 text-gray-900" : ""
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {activeTab === "additionalInfo" && (
            <div className="mt-3 text-xs sm:text-sm text-gray-600 font-light leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
              {product.additionalInfo || "Custom fitting and size adjustments available upon request.\nCare Instructions: Professional dry clean only.\nCountry of Origin: India."}
            </div>
          )}
        </div>
      </div>

      {/* Need Help with the Product? Section */}
      <div className="pt-8 pb-2">
        <h3 className="text-lg sm:text-xl font-normal text-gray-900 mb-4 font-sans tracking-wide">
          Need Help with the Product?
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Call Us */}
          <a
            href="tel:+919876543210"
            className="flex flex-col items-center justify-center p-4 sm:p-5 border border-gray-200 rounded-none hover:border-gray-900 transition-all duration-200 text-center group bg-white hover:shadow-sm"
          >
            <svg className="w-5 h-5 text-gray-800 group-hover:text-gray-900 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Call Us</span>
          </a>

          {/* Email Us */}
          <a
            href="mailto:elantraa.01@gmail.com"
            className="flex flex-col items-center justify-center p-4 sm:p-5 border border-gray-200 rounded-none hover:border-gray-900 transition-all duration-200 text-center group bg-white hover:shadow-sm"
          >
            <svg className="w-5 h-5 text-gray-800 group-hover:text-gray-900 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Email Us</span>
          </a>

          {/* WhatsApp Us */}
          <a
            href={`https://wa.me/919015342951?text=${encodeURIComponent(`Hi ELANTRAA, I need help with "${product.name}".`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 sm:p-5 border border-gray-200 rounded-none hover:border-gray-900 transition-all duration-200 text-center group bg-white hover:shadow-sm"
          >
            <svg className="w-6 h-6 text-[#25D366] mb-2 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-900">WhatsApp Us</span>
          </a>
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
            Size: {selectedSize}
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

      {/* Interactive Size Guide Modal */}
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
