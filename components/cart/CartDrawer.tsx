"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    shipping,
    total,
    promoCode,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!cartOpen) return null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setApplying(true);
    try {
      const res = await applyPromoCode(inputCode);
      setPromoMessage({ success: res.success, text: res.message });
      if (res.success) setInputCode("");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden font-sans">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={() => setCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-6 bg-[#171717] text-white flex items-center justify-between border-b border-[#C9A648]/30">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A648] animate-pulse" />
              <h2 className="text-sm font-serif uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Shopping Bag ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#C9A648]/20 flex items-center justify-center text-[#C9A648]">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-serif text-gray-900 font-medium">Your bag is empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs font-light">
                    Explore our luxury couture collection and add exquisite pieces to your shopping bag.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    router.push("/shop");
                  }}
                  className="px-6 py-2.5 bg-[#171717] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#C9A648] hover:text-white transition-colors"
                >
                  Explore Shop
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start">
                  <div className="relative w-20 h-24 rounded-lg bg-[#FAF8F5] overflow-hidden shrink-0 border border-gray-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="text-xs font-serif font-semibold text-gray-900 hover:text-[#C9A648] transition-colors truncate block"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-0.5 ml-2"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="text-[11px] text-gray-500 mt-1 space-x-2">
                      <span>Size: <strong className="text-gray-800">{item.size}</strong></span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold text-gray-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-semibold text-gray-900 font-sans">
                        ₹{((item.discountPrice || item.price) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-[#FAF8F5] border-t border-gray-200 space-y-4">
              {/* Promo Code Input */}
              <div>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded text-xs text-emerald-800">
                    <div>
                      <span className="font-semibold uppercase font-mono">{promoCode}</span> applied (-₹{discount.toLocaleString("en-IN")})
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-emerald-700 underline font-semibold text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs uppercase bg-white border border-gray-300 rounded focus:border-[#C9A648] outline-none font-mono"
                    />
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-4 py-2 bg-[#171717] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#C9A648] hover:text-white transition-colors"
                    >
                      {applying ? "..." : "Apply"}
                    </button>
                  </form>
                )}
                {promoMessage && (
                  <p className={`text-[11px] mt-1 ${promoMessage.success ? "text-emerald-600" : "text-rose-600"}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Promo Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-emerald-600 uppercase text-[10px]">Free</strong> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2 font-serif">
                  <span>Estimated Total</span>
                  <span className="text-[#9b7a1d] font-sans">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setCartOpen(false);
                    router.push("/cart");
                  }}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-900 text-xs font-semibold uppercase tracking-widest rounded hover:border-gray-900 transition-colors text-center"
                >
                  View Bag
                </button>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full py-3 bg-[#171717] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#C9A648] hover:text-white transition-colors text-center shadow-md"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
