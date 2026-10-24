"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function LoginPromptModal() {
  const pathname = usePathname();
  const { loginPromptOpen, loginPromptReason, closeLoginPrompt } = useCart();

  if (!loginPromptOpen) return null;

  const callbackUrl = encodeURIComponent(pathname || "/");
  const isWishlist = loginPromptReason === "wishlist";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-[#0C1220] via-[#090E1A] to-[#03060C] text-white border border-[#C9A648]/40 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden text-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#C9A648]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#AA771C]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeLoginPrompt}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A648]/50 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A648]/15 border border-[#C9A648]/40 flex items-center justify-center text-xl shadow-inner mb-3 text-[#D4AF37]">
          {isWishlist ? "❤️" : "🛍️"}
        </div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-[#C9A648] font-semibold mb-1">
          Account Required
        </p>

        <h3 className="text-xl font-serif text-white font-normal mb-2">
          {isWishlist ? "Sign In to Save Pieces" : "Sign In to Add to Bag"}
        </h3>

        <p className="text-xs text-gray-300 font-light leading-relaxed mb-6 max-w-xs mx-auto">
          {isWishlist
            ? "Please sign in to your ELANTRAA account to save your favorite luxury pieces to your wishlist."
            : "Please sign in to your ELANTRAA account to add items to your shopping bag and proceed."}
        </p>

        <div className="space-y-2.5">
          <Link
            href={`/login?callbackUrl=${callbackUrl}`}
            onClick={closeLoginPrompt}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-slate-950 text-xs font-semibold uppercase tracking-[0.18em] rounded-lg shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Sign In to Continue</span>
            <span>→</span>
          </Link>

          <Link
            href={`/signup?callbackUrl=${callbackUrl}`}
            onClick={closeLoginPrompt}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/15 text-xs font-medium uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center"
          >
            Create An Account
          </Link>
        </div>
      </div>
    </div>
  );
}
