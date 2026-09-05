"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/context/CartContext";

export interface PublicCoupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSpend: number | null;
  description: string;
}

interface ProductOffersProps {
  currentPrice: number;
}

export default function ProductOffers({ currentPrice }: ProductOffersProps) {
  const { applyPromoCode } = useCart();
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch("/api/coupons");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.coupons) && data.coupons.length > 0) {
            setCoupons(data.coupons);
          }
        }
      } catch (err) {
        console.warn("Could not fetch product offers", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, []);

  // Calculate the best applicable offer for this current product price
  const bestOffer = useMemo(() => {
    if (!coupons || coupons.length === 0 || currentPrice <= 0) return null;

    let maxSavings = 0;
    let selectedCoupon: PublicCoupon | null = null;

    for (const coupon of coupons) {
      // Check if eligible based on minSpend
      const minSpend = coupon.minSpend || 0;
      if (minSpend > 0 && currentPrice < minSpend) {
        continue;
      }

      let savings = 0;
      if (coupon.type === "percentage") {
        savings = Math.round((currentPrice * coupon.value) / 100);
      } else {
        savings = Math.min(coupon.value, currentPrice);
      }

      if (savings > maxSavings) {
        maxSavings = savings;
        selectedCoupon = coupon;
      }
    }

    // If no coupon meets minSpend alone, show the top coupon anyway with savings calculation
    if (!selectedCoupon && coupons.length > 0) {
      const topCoupon = coupons[0];
      const savings =
        topCoupon.type === "percentage"
          ? Math.round((currentPrice * topCoupon.value) / 100)
          : Math.min(topCoupon.value, currentPrice);
      return {
        coupon: topCoupon,
        savings,
        effectivePrice: Math.max(0, currentPrice - savings),
        isMinSpendRestricted: (topCoupon.minSpend || 0) > currentPrice,
      };
    }

    if (!selectedCoupon) return null;

    return {
      coupon: selectedCoupon,
      savings: maxSavings,
      effectivePrice: Math.max(0, currentPrice - maxSavings),
      isMinSpendRestricted: false,
    };
  }, [coupons, currentPrice]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);

    // Also pre-apply in the background so user gets discount automatically
    try {
      applyPromoCode(code);
    } catch {
      // ignore
    }

    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (loading || !bestOffer) {
    return null;
  }

  return (
    <>
      {/* Visual Offer Banner (as requested in screenshot) */}
      <div
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsModalOpen(true)}
        className="my-3.5 w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#EBF9F1] via-[#F2FBF6] to-[#EBF9F1] border border-[#B9E7CF] text-gray-800 cursor-pointer hover:border-[#86D5AF] hover:shadow-sm transition-all duration-200 group select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Badge Icon with % */}
          <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="5" x2="5" y2="19"></line>
              <circle cx="6.5" cy="6.5" r="2.5"></circle>
              <circle cx="17.5" cy="17.5" r="2.5"></circle>
            </svg>
          </div>

          {/* Offer text with highlighted price */}
          <div className="text-xs sm:text-[13px] text-gray-800 font-medium truncate">
            <span>Get it for </span>
            <span className="font-bold text-gray-950 font-sans">
              &#8377;{bestOffer.effectivePrice.toLocaleString("en-IN")}
            </span>
            <span> with offers</span>
            {bestOffer.coupon?.code && (
              <span className="hidden sm:inline text-gray-500 font-normal ml-1">
                (Code: <span className="font-semibold text-emerald-700">{bestOffer.coupon.code}</span>)
              </span>
            )}
          </div>
        </div>

        {/* Right Arrow / Chevron */}
        <div className="flex items-center pl-2 shrink-0 text-gray-500 group-hover:text-gray-800 group-hover:translate-x-0.5 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Interactive Offers & Promo Codes Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  %
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-gray-900">
                    Available Offers & Promo Codes
                  </h3>
                  <p className="text-[11px] text-gray-500 font-sans">
                    Copy code to use at checkout to enjoy exclusive savings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body: Offers List */}
            <div className="p-5 overflow-y-auto space-y-4 divide-y divide-gray-100/80">
              {coupons.map((coupon) => {
                const savings =
                  coupon.type === "percentage"
                    ? Math.round((currentPrice * coupon.value) / 100)
                    : Math.min(coupon.value, currentPrice);
                const finalItemPrice = Math.max(0, currentPrice - savings);
                const isEligible = !coupon.minSpend || currentPrice >= coupon.minSpend;
                const isCopied = copiedCode === coupon.code;

                return (
                  <div
                    key={coupon.id}
                    className="pt-4 first:pt-0 flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300/70 text-xs font-mono font-bold tracking-wider rounded uppercase">
                          {coupon.code}
                        </span>
                        {isEligible ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Save &#8377;{savings.toLocaleString("en-IN")} on this piece
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Min spend &#8377;{coupon.minSpend?.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-700 font-medium">{coupon.description}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Special price with this code:{" "}
                        <span className="font-semibold text-gray-900 font-sans">
                          &#8377;{finalItemPrice.toLocaleString("en-IN")}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(coupon.code)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-xs ${
                          isCopied
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105"
                            : "bg-white hover:bg-gray-50 text-gray-900 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
