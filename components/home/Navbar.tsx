"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
}

export default function Navbar({
  cartCount: customCartCount,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
}: NavbarProps) {
  const { data: session } = useSession();
  const accountHref = session?.user ? "/account" : "/login";
  const { cartCount: ctxCartCount } = useCart();
  const activeCartCount = customCartCount !== undefined ? customCartCount : ctxCartCount;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navCategories, setNavCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setNavCategories(data.categories);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch nav categories", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [announcementText, setAnnouncementText] = useState("COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000");

  useEffect(() => {
    async function loadHeadline() {
      try {
        const res = await fetch("/api/hero");
        if (res.ok) {
          const data = await res.json();
          if (data.hero?.announcement) {
            setAnnouncementText(data.hero.announcement);
          }
        }
      } catch (err) {
        console.warn("Failed to load navbar headline", err);
      }
    }
    loadHeadline();
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#171717] text-[#D4AF37] text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wider uppercase border-b border-[#C9A648]/20 flex items-center justify-between sm:justify-center relative z-40">
        <span className="hidden sm:inline">✦ {announcementText} ✦</span>
        <span className="sm:hidden text-center w-full">{announcementText}</span>
        <span className="hidden md:inline-block absolute right-6 text-[10px] text-gray-400 font-sans">
          USE CODE: <strong className="text-[#C9A648]">ELANTRAAGOLD</strong>
        </span>
      </div>

      {/* Main Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-[#C9A648]/20"
            : "bg-white py-4 border-b border-gray-100"
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Menu Button */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 lg:hidden shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-gray-700 hover:text-[#C9A648] transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Mobile Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 sm:p-2 text-gray-700 hover:text-[#C9A648] transition-colors"
              aria-label="Search Products"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-medium tracking-[0.15em] text-gray-800 uppercase">
            <Link href="/shop" className="hover:text-[#C9A648] transition-colors font-semibold text-[#C9A648]">
              Shop All
            </Link>
            {navCategories.length > 0 ? (
              navCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="hover:text-[#C9A648] transition-colors"
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              <>
                <Link href="/category/women" className="hover:text-[#C9A648] transition-colors">
                  Women
                </Link>
                <Link href="/category/men" className="hover:text-[#C9A648] transition-colors">
                  Men
                </Link>
                <Link href="/category/accessories" className="hover:text-[#C9A648] transition-colors">
                  Accessories
                </Link>
              </>
            )}
            <Link href="/category/new-arrivals" className="hover:text-[#C9A648] transition-colors">
              New Arrivals
            </Link>
            <Link href="/category/sale" className="hover:text-[#C9A648] transition-colors text-red-600 font-semibold">
              Sale
            </Link>
          </nav>

          {/* Center: Brand Name (Text Only) */}
          <div className="text-center min-w-0 flex-1 lg:flex-none px-1">
            <Link href="/" className="inline-block group">
              <span className="text-xl sm:text-2xl lg:text-3xl font-serif tracking-[0.18em] sm:tracking-[0.25em] font-light text-gray-900 group-hover:text-[#C9A648] transition-colors truncate">
                ELANTRAA
              </span>
            </Link>
          </div>

          {/* Right Utilities (Search, Account, Wishlist, Cart) */}
          <div className="flex items-center space-x-2.5 sm:space-x-5 text-gray-700 shrink-0 pr-1">
            {/* Search (Desktop) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center text-xs tracking-widest uppercase hover:text-[#C9A648] transition-colors"
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </button>

            {/* Account */}
            <Link href={accountHref} className="p-1 hover:text-[#C9A648] transition-colors" aria-label="Account">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="p-1 hover:text-[#C9A648] transition-colors relative"
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#C9A648] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button / Link */}
            {onOpenCart ? (
              <button
                onClick={onOpenCart}
                className="p-1 hover:text-[#C9A648] transition-colors relative"
                aria-label="Shopping Cart"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {activeCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-[#171717] text-[#D4AF37] text-[10px] font-bold rounded-full flex items-center justify-center border border-[#C9A648]/40 shadow-sm leading-none">
                    {activeCartCount}
                  </span>
                )}
              </button>
            ) : (
              <Link
                href="/cart"
                className="p-1 hover:text-[#C9A648] transition-colors relative inline-block"
                aria-label="Shopping Cart"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {activeCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-[#171717] text-[#D4AF37] text-[10px] font-bold rounded-full flex items-center justify-center border border-[#C9A648]/40 shadow-sm leading-none">
                    {activeCartCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <span className="text-xl font-serif tracking-[0.2em] text-gray-900">ELANTRAA</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="py-5 space-y-4 text-xs sm:text-sm font-medium tracking-widest uppercase text-gray-800">
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-[#C9A648] font-bold py-1 border-b border-gray-100"
                >
                  ✦ Shop All Catalogue
                </Link>
                {navCategories.length > 0 ? (
                  navCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block hover:text-[#C9A648] transition-colors py-1"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link
                      href="/category/women"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block hover:text-[#C9A648] transition-colors py-1"
                    >
                      Women&apos;s Collection
                    </Link>
                    <Link
                      href="/category/men"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block hover:text-[#C9A648] transition-colors py-1"
                    >
                      Men&apos;s Collection
                    </Link>
                    <Link
                      href="/category/accessories"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block hover:text-[#C9A648] transition-colors py-1"
                    >
                      Accessories
                    </Link>
                  </>
                )}
                <Link
                  href="/category/new-arrivals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:text-[#C9A648] transition-colors py-1"
                >
                  New Arrivals
                </Link>
                <Link
                  href="/category/sale"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-red-600 font-semibold transition-colors py-1"
                >
                  Sale & Offers
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-[#171717] font-semibold transition-colors py-1 border-t border-gray-100 pt-3"
                >
                  ⚙ Admin Dashboard
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center space-x-3 text-xs">
                <Link
                  href={accountHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 px-3 bg-gray-100 text-gray-800 text-center font-medium rounded uppercase tracking-wider"
                >
                  {session?.user ? "My Profile" : "Sign In"}
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 px-3 bg-[#171717] text-[#D4AF37] text-center font-medium rounded uppercase tracking-wider"
                >
                  Cart ({activeCartCount})
                </Link>
              </div>

              <div className="text-[11px] text-gray-500 font-sans space-y-1 pt-1">
                <p className="font-semibold text-gray-800 uppercase tracking-wider">Customer Care</p>
                <p>Mon - Sat: 10am - 8pm IST</p>
                <p className="text-[#C9A648]">concierge@elantraa.com</p>
              </div>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Interactive Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-sm font-serif uppercase tracking-widest text-[#C9A648] mb-3">
              Search ELANTRAA Catalogue
            </h3>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search dresses, kurtas, shirts, silk co-ords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-lg border-b-2 border-[#C9A648] py-2 px-1 focus:outline-none bg-transparent placeholder-gray-400 font-serif"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="ml-3 px-5 py-2 bg-[#171717] text-[#D4AF37] text-xs uppercase tracking-widest rounded hover:bg-[#C9A648] hover:text-white transition-colors"
              >
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="text-gray-400">Popular:</span>
              {["Wrap Dress", "Embroidered Kurta", "Oxford Shirt", "Linen Co-ord", "Gold Accessories"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-2.5 py-1 bg-gray-100 rounded-full hover:bg-[#C9A648]/10 hover:text-[#C9A648] transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
