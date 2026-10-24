"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export interface ShareProductData {
  id: string;
  name: string;
  slug: string;
  price?: number;
  discountPrice?: number | null;
  images?: string[];
  category?: string | { name?: string };
}

interface ProductShareButtonProps {
  product: ShareProductData;
  variant?: "card-icon" | "pdp-button" | "pdp-strip";
  className?: string;
}

export default function ProductShareButton({
  product,
  variant = "card-icon",
  className = "",
}: ProductShareButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getProductUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/products/${product.slug}`;
    }
    return `https://elantraa.com/products/${product.slug}`;
  };

  const getShareMessage = () => {
    const effectivePrice = product.discountPrice || product.price;
    const priceText = effectivePrice ? ` (₹${effectivePrice.toLocaleString("en-IN")})` : "";
    return `Look at this handcrafted piece from ELANTRAA: "${product.name}"${priceText} ✨\n\nView details: ${getProductUrl()}`;
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = getProductUrl();
    const title = product.name;
    const text = `Look at this handcrafted piece from ELANTRAA: "${product.name}" ✨`;

    // Detect mobile device
    const isMobile =
      typeof window !== "undefined" &&
      /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent || ""
      );

    // If on mobile and native share is supported, trigger native sheet
    if (isMobile && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        // If user cancelled, don't force open modal; if error, fall through to modal
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    // Default to luxury share modal
    setModalOpen(true);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(getProductUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <>
      {/* 1. Card Icon Variant (Compact circle on product cards) */}
      {variant === "card-icon" && (
        <button
          type="button"
          onClick={handleShareClick}
          className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-md bg-white/80 text-gray-600 hover:text-[#25D366] hover:bg-white group/share ${className}`}
          title="Share via WhatsApp or link"
          aria-label="Share product"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover/share:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      )}

      {/* 2. PDP Button Variant (Next to Wishlist Button) */}
      {variant === "pdp-button" && (
        <button
          type="button"
          onClick={handleShareClick}
          className={`p-3.5 sm:p-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:text-[#25D366] hover:border-[#25D366]/40 transition-all flex items-center justify-center shadow-sm hover:shadow group/pdp-share ${className}`}
          title="Share with family or stylist"
          aria-label="Share product"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover/pdp-share:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      )}

      {/* 3. PDP Strip Variant (Direct WhatsApp button) */}
      {variant === "pdp-strip" && (
        <button
          type="button"
          onClick={handleShareClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] hover:text-[#075E54] border border-[#25D366]/30 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${className}`}
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>Share</span>
        </button>
      )}

      {/* Luxury Share Modal Dialog */}
      {modalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setModalOpen(false)}
          >
          <div
            className="relative w-full max-w-sm bg-gradient-to-b from-[#1C1F26] to-[#111317] text-white border border-[#C9A648]/40 rounded-2xl p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Ambient gold glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#C9A648]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <span className="text-[10px] tracking-[0.25em] text-[#C9A648] uppercase font-semibold">
                Share This Piece
              </span>
              <h3 className="text-lg font-serif text-white font-normal mt-0.5 line-clamp-1">
                {product.name}
              </h3>
            </div>

            {/* Product Snapshot */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10 mb-5">
              <div className="relative w-12 h-16 rounded overflow-hidden bg-gray-800 shrink-0">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[8px] text-gray-400">
                    ELANTRAA
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-serif text-white truncate">{product.name}</p>
                <p className="text-xs font-semibold text-[#D4AF37] font-sans mt-0.5">
                  ₹{(product.discountPrice || product.price || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-light">
                  Handcrafted Couturière
                </p>
              </div>
            </div>

            {/* Share Action Buttons */}
            <div className="space-y-2.5">
              {/* WhatsApp Direct Share */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Share via WhatsApp</span>
              </button>

              {/* Native System Share (if browser supports it) */}
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      await navigator.share({
                        title: product.name,
                        text: `Look at this handcrafted piece from ELANTRAA: "${product.name}" ✨`,
                        url: getProductUrl(),
                      });
                      setModalOpen(false);
                    } catch {
                      // user dismiss
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-medium uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span>More Sharing Options</span>
                </button>
              )}

              {/* Copy Direct Link */}
              <div className="pt-2">
                <label className="block text-[10px] text-gray-400 uppercase tracking-widest text-left mb-1.5 font-medium">
                  Direct Link
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/15 rounded-lg">
                  <input
                    type="text"
                    readOnly
                    value={getProductUrl()}
                    className="w-full bg-transparent text-[11px] text-gray-300 px-2 py-1 outline-none font-mono truncate"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded shrink-0 transition-colors ${
                      copied
                        ? "bg-[#25D366] text-white"
                        : "bg-[#C9A648] hover:bg-[#AA771C] text-slate-950 font-bold"
                    }`}
                  >
                    {copied ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Scan on Phone QR Preview */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-left">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#C9A648] font-semibold">
                    Scan on Phone
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Point camera to open link instantly
                  </p>
                </div>
                <div className="w-12 h-12 bg-white rounded p-1 shrink-0 flex items-center justify-center shadow-inner">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(
                      getProductUrl()
                    )}`}
                    alt="Product QR code"
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
