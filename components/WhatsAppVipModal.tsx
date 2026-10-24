"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const STORAGE_KEY = "elantraa_offer_modal_dismissed";
const SUBSCRIBED_KEY = "elantraa_offer_subscribed";

export default function WhatsAppVipModal() {
  const pathname = usePathname();
  const { cartOpen } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubscribedAlready, setIsSubscribedAlready] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setError(null);
        if (!unlockedCode) {
          localStorage.setItem(STORAGE_KEY, Date.now().toString());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, unlockedCode]);

  useEffect(() => {
    // Check if user already subscribed
    const alreadySub = localStorage.getItem(SUBSCRIBED_KEY);
    if (alreadySub) {
      setIsSubscribedAlready(true);
      return;
    }

    // Show subtle teaser tag after 2 seconds
    const teaserTimer = setTimeout(() => {
      setShowTeaser(true);
    }, 2000);

    // Auto-dismiss teaser after 8 seconds
    const teaserDismissTimer = setTimeout(() => {
      setShowTeaser(false);
    }, 10000);

    // Check if recently dismissed modal (within 5 days)
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const daysSince =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 5) {
        return () => {
          clearTimeout(teaserTimer);
          clearTimeout(teaserDismissTimer);
        };
      }
    }

    // Auto-open modal after 6 seconds for first-time visitors
    const autoOpenTimer = setTimeout(() => {
      setIsOpen(true);
      setShowTeaser(false);
    }, 6000);

    return () => {
      clearTimeout(teaserTimer);
      clearTimeout(teaserDismissTimer);
      clearTimeout(autoOpenTimer);
    };
  }, []);

  // Hide on admin routes or when cart is open
  if (pathname?.startsWith("/admin") || cartOpen) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    if (!unlockedCode) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowTeaser(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/whatsapp/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: clean,
          source: "FLOATING_OFFER_BUTTON",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process request. Please try again.");
        setLoading(false);
        return;
      }

      setUnlockedCode(data.discountCode || "ELANTRAAGOLD");
      localStorage.setItem(SUBSCRIBED_KEY, "true");
      setIsSubscribedAlready(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!unlockedCode) return;
    navigator.clipboard.writeText(unlockedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Floating Offer Button (Bottom-Left) */}
      {!isOpen && (
        <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 flex flex-col items-start select-none">
          {/* Subtle Teaser Bubble (First Load) */}
          {showTeaser && !isSubscribedAlready && (
            <div className="mb-2 relative px-3 py-1.5 bg-white text-slate-900 border border-[#C9A648]/40 rounded-full shadow-xl text-[11px] font-medium tracking-wide flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-[#C9A648]">✨</span>
              <span>10% OFF Coupon Code</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeaser(false);
                }}
                className="ml-1 text-gray-400 hover:text-gray-700 text-xs"
              >
                ✕
              </button>
              <div className="absolute -bottom-1 left-6 w-2 h-2 bg-white border-r border-b border-[#C9A648]/40 rotate-45" />
            </div>
          )}

          {/* Clean, Refined Floating Pill Trigger */}
          <button
            onClick={handleOpen}
            aria-label="Get 10% OFF Coupon"
            className="group relative flex items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#090D16]/95 backdrop-blur-md text-white border border-[#C9A648]/50 hover:border-[#D4AF37] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.35),0_0_15px_rgba(201,166,72,0.18)] hover:shadow-[0_6px_25px_rgba(201,166,72,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {/* Elegant Gift Icon */}
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/25 via-[#C9A648]/15 to-transparent border border-[#D4AF37]/50 flex items-center justify-center shrink-0 text-[#E5C158]">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M12 8v13" />
                <path d="M3 12h18" />
                <path d="M12 8c-2-3-5.5-2-5.5 0 0 1.5 3 2 5.5 2z" />
                <path d="M12 8c2-3 5.5-2 5.5 0 0 1.5-3 2-5.5 2z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#090D16] animate-pulse" />
            </div>

            {/* Clean Typography */}
            <div className="text-left flex flex-col justify-center pr-1">
              <span className="text-[9px] uppercase tracking-[0.22em] text-[#C9A648] font-semibold leading-tight">
                Special Offer
              </span>
              <span className="text-xs sm:text-sm font-medium tracking-tight text-white group-hover:text-[#F7EACD] flex items-center gap-1 transition-colors">
                <span>Get 10% OFF</span>
                <span className="text-[#D4AF37] group-hover:translate-x-0.5 transition-transform duration-200">
                  →
                </span>
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
            onClick={handleClose}
          >
            <div
              className="relative w-full max-w-md bg-gradient-to-b from-[#0C1220] via-[#090E1A] to-[#03060C] text-white border border-[#C9A648]/40 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Subtle Ambient Gold Glows */}
              <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#C9A648]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-[#AA771C]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                className="absolute top-3.5 right-3.5 z-40 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 hover:border-[#C9A648]/60 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group/close"
                title="Close modal"
                aria-label="Close offer modal"
              >
                <svg
                  className="w-4 h-4 stroke-current stroke-2 transition-transform duration-200 group-hover/close:rotate-90 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {!unlockedCode ? (
                // Clean Subscription Form
              <div className="relative z-10 text-center">
                {/* Gift Emblem */}
                <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A648]/15 border border-[#C9A648]/40 flex items-center justify-center text-xl shadow-inner mb-3 text-[#D4AF37]">
                  <svg
                    className="w-5 h-5 fill-none stroke-current"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="8" width="18" height="13" rx="2" />
                    <path d="M12 8v13" />
                    <path d="M3 12h18" />
                    <path d="M12 8c-2-3-5.5-2-5.5 0 0 1.5 3 2 5.5 2z" />
                    <path d="M12 8c2-3 5.5-2 5.5 0 0 1.5-3 2-5.5 2z" />
                  </svg>
                </div>

                <p className="text-[10px] uppercase tracking-[0.28em] text-[#C9A648] font-semibold mb-1">
                  Welcome Offer
                </p>

                <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-wide mb-1.5">
                  Unlock 10% OFF
                </h2>

                <p className="text-xs text-gray-300 font-light leading-relaxed max-w-xs mx-auto mb-5">
                  Enter your WhatsApp number to instantly receive your{" "}
                  <strong className="text-[#D4AF37] font-semibold">10% discount code</strong> for your order.
                </p>

                {error && (
                  <div className="mb-3.5 p-2 bg-red-950/50 border border-red-500/40 text-red-300 text-xs rounded-lg text-left">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-[10px] font-medium tracking-wider uppercase text-gray-400 mb-1.5">
                      WhatsApp Mobile Number <span className="text-[#D4AF37]">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-white/5 border border-r-0 border-white/15 rounded-l-lg text-xs font-medium text-gray-300">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3.5 py-2.5 bg-[#03060C] border border-white/15 focus:border-[#D4AF37] rounded-r-lg text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors tracking-wider"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 leading-normal font-light pt-0.5">
                    🔒 No spam. Curated offers and updates only. Reply STOP anytime.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-slate-950 text-xs font-semibold uppercase tracking-[0.18em] rounded-lg shadow-md hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Unlocking Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Get 10% OFF Code</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // Success Code Display
              <div className="relative z-10 text-center py-1 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xl shadow-inner mb-3">
                  ✓
                </div>

                <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-1">
                  Offer Unlocked
                </p>

                <h3 className="text-xl font-serif text-white font-normal mb-1.5">
                  Your Discount Code
                </h3>

                <p className="text-xs text-gray-300 font-light mb-5">
                  Apply this promo code during checkout to claim your 10% discount:
                </p>

                {/* Promo Code Copy Card */}
                <div className="p-3.5 bg-white/5 border border-dashed border-[#D4AF37]/60 rounded-xl mb-5">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">
                    10% Discount Code
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-[#F7EACD]">
                      {unlockedCode}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 bg-[#D4AF37] hover:bg-[#C9A648] text-slate-950 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors shadow"
                    >
                      {copied ? "Copied! ✓" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={`https://wa.me/919015342951?text=${encodeURIComponent(
                      `Hello ELANTRAA Concierge, I claimed the 10% discount with code ${unlockedCode}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>WhatsApp Concierge</span>
                    <span>💬</span>
                  </a>

                  <Link
                    href="/shop"
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-slate-950 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Shop Now</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
