"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

interface MobileBottomNavProps {
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
}

export default function MobileBottomNav({ onOpenCart, onOpenWishlist }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cartCount, wishlistCount } = useCart();

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const accountHref = session?.user ? "/account" : "/login";

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl py-2 px-3 lg:hidden flex items-center justify-around font-sans">
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
          pathname === "/" ? "text-[#C9A648] font-bold" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Home</span>
      </Link>

      {/* Shop */}
      <Link
        href="/shop"
        className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
          pathname === "/shop" ? "text-[#C9A648] font-bold" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span>Shop</span>
      </Link>

      {/* Wishlist */}
      {onOpenWishlist ? (
        <button
          onClick={onOpenWishlist}
          className="flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-600 hover:text-gray-900 relative"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
          <span>Wishlist</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-1 right-2 min-w-[15px] h-[15px] px-1 bg-[#C9A648] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </button>
      ) : (
        <Link
          href="/account?tab=wishlist"
          className="flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-600 hover:text-gray-900 relative"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
          <span>Wishlist</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-1 right-2 min-w-[15px] h-[15px] px-1 bg-[#C9A648] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>
      )}

      {/* Cart */}
      {onOpenCart ? (
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-600 hover:text-gray-900 relative"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 right-1.5 min-w-[15px] h-[15px] px-1 bg-[#171717] text-[#D4AF37] text-[9px] font-bold rounded-full flex items-center justify-center border border-[#C9A648]/40">
              {cartCount}
            </span>
          )}
        </button>
      ) : (
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-600 hover:text-gray-900 relative"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 right-1.5 min-w-[15px] h-[15px] px-1 bg-[#171717] text-[#D4AF37] text-[9px] font-bold rounded-full flex items-center justify-center border border-[#C9A648]/40">
              {cartCount}
            </span>
          )}
        </Link>
      )}

      {/* Profile */}
      <Link
        href={accountHref}
        className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors ${
          pathname === "/account" || pathname === "/login" ? "text-[#C9A648] font-bold" : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Account</span>
      </Link>
    </div>
  );
}
