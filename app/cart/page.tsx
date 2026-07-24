"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
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

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode) return;
    const res = applyPromoCode(inputCode);
    setPromoMessage({ success: res.success, text: res.message });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Breadcrumb Navigation */}
        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Shopping Bag</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="flex items-end justify-between border-b border-gray-200 pb-6 mb-8">
            <div>
              <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
                YOUR COUTURE SELECTION
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mt-1 tracking-tight">
                Shopping Bag
              </h1>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 hover:text-red-500 underline uppercase tracking-wider"
              >
                Empty Bag
              </button>
            )}
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="hidden sm:grid grid-cols-12 text-xs font-semibold uppercase tracking-widest text-gray-500 pb-3 border-b border-gray-200">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const unitPrice = item.discountPrice || item.price;
                    const itemTotal = unitPrice * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="py-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center"
                      >
                        {/* Product Thumbnail & Details */}
                        <div className="sm:col-span-6 flex items-center space-x-4 w-full">
                          <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-gray-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover object-center"
                            />
                          </div>

                          <div className="flex-1">
                            <Link
                              href={`/products/${item.slug}`}
                              className="text-sm font-serif font-semibold text-gray-900 hover:text-[#C9A648] transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>

                            <div className="text-xs text-gray-500 space-y-0.5 mt-1 font-light">
                              <p>
                                Size: <strong className="font-semibold text-gray-700">{item.size}</strong> | Color:{" "}
                                <strong className="font-semibold text-gray-700">{item.color}</strong>
                              </p>
                              <p className="text-gray-900 font-medium">
                                &#8377;{unitPrice.toLocaleString("en-IN")}
                              </p>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="mt-2 text-[11px] text-red-500 hover:text-red-700 underline font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Quantity Picker */}
                        <div className="sm:col-span-3 flex items-center justify-center w-full sm:w-auto">
                          <div className="inline-flex items-center border border-gray-300 rounded p-1 bg-gray-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 text-gray-600 hover:bg-white rounded font-bold text-sm flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 text-gray-600 hover:bg-white rounded font-bold text-sm flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="sm:col-span-3 text-right w-full sm:w-auto flex justify-between sm:block">
                          <span className="sm:hidden text-xs text-gray-500">Subtotal:</span>
                          <span className="text-sm font-semibold text-gray-900 font-sans">
                            &#8377;{itemTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Summary Box */}
              <div className="bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
                <h3 className="text-lg font-serif font-semibold text-gray-900 border-b border-gray-200 pb-3">
                  Order Summary
                </h3>

                {/* Promo Code Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Promo Code
                  </label>
                  {promoCode ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                      <span>
                        Code <strong>{promoCode}</strong> Applied!
                      </span>
                      <button
                        onClick={removePromoCode}
                        className="text-red-500 underline font-semibold ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ELANTRAAGOLD"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-[#C9A648] uppercase tracking-wider"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-widest rounded hover:bg-[#C9A648] hover:text-white transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {promoMessage && (
                    <p
                      className={`text-[11px] mt-1.5 font-medium ${
                        promoMessage.success ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Try code <strong className="text-[#C9A648]">ELANTRAAGOLD</strong> for &#8377;500 discount
                  </p>
                </div>

                {/* Price Calculation Lines */}
                <div className="space-y-3 text-xs text-gray-600 border-t border-b border-gray-200 py-4 font-sans">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      &#8377;{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Promo Savings ({promoCode})</span>
                      <span>- &#8377;{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Express Worldwide Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-[10px]">
                          COMPLIMENTARY
                        </span>
                      ) : (
                        `\u20B9${shipping}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Estimated GST (Included)</span>
                    <span>18%</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline text-lg font-serif font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-xl text-[#C9A648]">
                    &#8377;{total.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Proceed to Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white font-medium text-xs tracking-[0.2em] uppercase rounded-md shadow-lg hover:shadow-[#C9A648]/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Proceed To Checkout</span>
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-light">
                  ✦ Guaranteed 256-Bit SSL Encrypted Checkout ✦
                </p>
              </div>
            </div>
          ) : (
            /* Empty Cart View */
            <div className="text-center py-20 bg-[#FAF8F5] rounded-2xl border border-dashed border-gray-300 p-8 max-w-xl mx-auto">
              <svg
                className="w-16 h-16 text-[#C9A648] mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="text-2xl font-serif text-gray-900 font-semibold mb-2">
                Your Shopping Bag is Empty
              </h2>
              <p className="text-xs text-gray-500 font-light mb-6">
                Discover our haute couture dresses, embroidered kurtas, and tailored menswear.
              </p>
              <Link
                href="/shop"
                className="inline-block px-8 py-3.5 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-[0.2em] rounded shadow hover:bg-[#C9A648] hover:text-white transition-colors"
              >
                Explore Shop Catalogue
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
