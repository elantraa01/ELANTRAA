"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
}

export default function Navbar({
  cartCount: customCartCount,
  wishlistCount: customWishlistCount,
  onOpenCart,
  onOpenWishlist,
}: NavbarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const accountHref = session?.user ? "/account" : "/login";
  const { cartCount: ctxCartCount, wishlistCount: ctxWishlistCount, setCartOpen } = useCart();
  const activeCartCount = customCartCount !== undefined ? customCartCount : ctxCartCount;
  const wishlistCount = customWishlistCount !== undefined ? customWishlistCount : ctxWishlistCount;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; slug: string; price: number; discountPrice: number | null; image: string; categoryName: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [navCategories, setNavCategories] = useState<
    { id: string; name: string; slug: string; parentCategoryId?: string | null; subcategories?: { id: string; name: string; slug: string }[] }[]
  >([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch (err) {
        console.warn("Live search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
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

  const [mobileActiveTab, setMobileActiveTab] = useState<"menu" | "categories">("menu");

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (!query) return;

    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#171717] text-[#D4AF37] text-[10px] sm:text-xs py-1 px-3 sm:px-4 text-center font-medium tracking-wider uppercase border-b border-[#C9A648]/20 flex items-center justify-between sm:justify-center relative z-40">
        <span className="hidden sm:inline">✦ {announcementText} ✦</span>
        <span className="sm:hidden text-center w-full">{announcementText}</span>
        <span className="hidden md:inline-block absolute right-6 text-[10px] text-gray-400 font-sans">
          USE CODE: <strong className="text-[#C9A648]">ELANTRAAGOLD</strong>
        </span>
      </div>

      {/* Main Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md py-1 sm:py-1.5 border-b border-[#C9A648]/20"
            : "bg-white py-1.5 sm:py-2 border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Left: Mobile Menu Button */}
          <div className="flex items-center gap-1 lg:hidden shrink-0">
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
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-medium tracking-[0.15em] text-gray-800 uppercase relative z-10">
            <Link href="/shop" className="hover:text-[#C9A648] transition-colors font-semibold text-[#C9A648] cursor-pointer">
              Shop All
            </Link>
            {navCategories.length > 0 ? (
              navCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="hover:text-[#C9A648] transition-colors cursor-pointer"
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              <>
                <Link href="/category/women" className="hover:text-[#C9A648] transition-colors cursor-pointer">
                  Women
                </Link>
                <Link href="/category/men" className="hover:text-[#C9A648] transition-colors cursor-pointer">
                  Men
                </Link>
                <Link href="/category/accessories" className="hover:text-[#C9A648] transition-colors cursor-pointer">
                  Accessories
                </Link>
              </>
            )}
            <Link href="/category/new-arrivals" className="hover:text-[#C9A648] transition-colors cursor-pointer">
              New Arrivals
            </Link>
            <Link href="/category/sale" className="hover:text-[#C9A648] transition-colors text-red-600 font-semibold cursor-pointer">
              Sale
            </Link>
          </nav>

          {/* Center: Brand Logo */}
          <div className="text-center min-w-0 flex-1 lg:flex-none px-2 shrink-0 relative z-10">
            <Link href="/" className="inline-flex items-center justify-center group py-1" aria-label="ELANTRAA Home">
              <span className="relative block w-36 h-9 sm:w-44 sm:h-10 lg:w-48 lg:h-11">
                <Image
                  src="/images/logo/logo.png"
                  alt="ELANTRAA"
                  fill
                  className="object-contain object-center transition-transform group-hover:scale-105"
                  priority
                />
              </span>
            </Link>
          </div>

          {/* Right Utilities (Search, Account, Wishlist, Cart) */}
          <div className="flex items-center gap-2 sm:gap-5 text-gray-700 shrink-0 pr-0.5 sm:pr-1 relative z-10">
            {/* Search (Desktop) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center text-xs tracking-widest uppercase hover:text-[#C9A648] transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </button>

            {/* Account */}
            <Link href={accountHref} className="hidden sm:inline-block p-1 hover:text-[#C9A648] transition-colors cursor-pointer" aria-label="Account">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-1 hover:text-[#C9A648] transition-colors relative inline-block cursor-pointer"
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
            </Link>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={onOpenCart || (() => setCartOpen(true))}
              className="p-1 hover:text-[#C9A648] transition-colors relative cursor-pointer"
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
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (Tabbed like screenshot) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-[85%] max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-300">
            {/* Drawer Header Tabs: MENU & CATEGORIES + Close Button */}
            <div className="border-b border-gray-200 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
              <div className="flex-1 flex">
                <button
                  type="button"
                  onClick={() => setMobileActiveTab("menu")}
                  className={`flex-1 py-3 text-center text-xs font-semibold tracking-widest uppercase transition-colors relative ${
                    mobileActiveTab === "menu"
                      ? "text-gray-900 bg-white font-bold"
                      : "text-gray-500 hover:text-gray-800 bg-gray-100/70"
                  }`}
                >
                  MENU
                  {mobileActiveTab === "menu" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A648]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileActiveTab("categories")}
                  className={`flex-1 py-3 text-center text-xs font-semibold tracking-widest uppercase transition-colors relative ${
                    mobileActiveTab === "categories"
                      ? "text-gray-900 bg-white font-bold"
                      : "text-gray-500 hover:text-gray-800 bg-gray-100/70"
                  }`}
                >
                  CATEGORIES
                  {mobileActiveTab === "categories" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A648]" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-gray-700 hover:text-black hover:bg-gray-100 transition-colors border-l border-gray-200"
                aria-label="Close Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="flex-1 overflow-y-auto">
              {mobileActiveTab === "menu" ? (
                /* MENU CONTENT */
                <div className="py-1 divide-y divide-gray-100">
                  <Link
                    href="/category/new-arrivals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    New Arrival
                  </Link>
                  {navCategories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:bg-gray-50 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    href="/shop?featured=true"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    Best Seller
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenWishlist) onOpenWishlist();
                    }}
                    className="w-full text-left px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                    <span>Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="w-full text-left px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </button>

                  <Link
                    href={accountHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{session?.user ? "My Account" : "Login / Register"}</span>
                  </Link>

                  <Link
                    href="/returns"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 014 4v1" />
                    </svg>
                    <span>Return/Exchange Request</span>
                  </Link>

                  {/* Need help? Footer section matching screenshot */}
                  <div className="p-5 bg-gray-50/80 mt-4 space-y-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-800 tracking-wider">Need help?</p>
                    <a
                      href="tel:+919015342951"
                      className="flex items-center space-x-2 text-xs text-gray-600 hover:text-[#C9A648] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="underline decoration-gray-300 underline-offset-4">+91 9015342951</span>
                    </a>
                    <a
                      href="mailto:elantraa.01@gmail.com"
                      className="flex items-center space-x-2 text-xs text-gray-600 hover:text-[#C9A648] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="underline decoration-gray-300 underline-offset-4">elantraa.01@gmail.com</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* CATEGORIES CONTENT */
                <div className="py-1 divide-y divide-gray-100">
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-5 py-3.5 text-xs sm:text-sm font-semibold tracking-wider text-[#C9A648] hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>All Products & Catalogue</span>
                    <svg className="w-4 h-4 text-[#C9A648]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  {navCategories && navCategories.length > 0 ? (
                    navCategories.map((cat) => (
                      <div key={cat.id} className="py-0.5">
                        <Link
                          href={`/shop?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:text-[#C9A648] hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          <span className="capitalize">{cat.name}</span>
                          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        {/* Display subcategories if present from database */}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="pl-8 pr-5 py-1 space-y-1 bg-gray-50/60 border-t border-b border-gray-100">
                            {cat.subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/shop?category=${encodeURIComponent(sub.name)}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1.5 text-xs text-gray-600 hover:text-[#C9A648] transition-colors"
                              >
                                ↳ {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    /* Fallback categories */
                    [
                      { name: "Women's Wear", href: "/category/women" },
                      { name: "Men's Collection", href: "/category/men" },
                      { name: "Lehenga Choli", href: "/shop?category=Lehenga%20choli" },
                      { name: "Saree Collection", href: "/shop?category=Saree" },
                      { name: "Dresses & Gowns", href: "/category/dresses" },
                      { name: "Tops & Kurtas", href: "/category/tops" },
                      { name: "Outerwear & Jackets", href: "/category/outerwear" },
                      { name: "Luxury Accessories", href: "/category/accessories" },
                      { name: "New Arrivals", href: "/category/new-arrivals" },
                      { name: "Sale & Offers", href: "/category/sale" },
                    ].map((cat, idx) => (
                      <Link
                        key={idx}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-5 py-3.5 text-xs sm:text-sm font-medium tracking-wider text-gray-800 hover:text-[#C9A648] hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))
                  )}
                </div>
              )}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                className="w-full text-lg border-b-2 border-[#C9A648] py-2 px-1 focus:outline-none bg-transparent placeholder-gray-400 font-serif"
                autoFocus
              />
              <button
                onClick={handleSearchSubmit}
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

            {/* Live Search Results List */}
            {searchQuery.trim() && (
              <div className="mt-5 border-t border-gray-100 pt-4 max-h-72 overflow-y-auto divide-y divide-gray-100">
                {isSearching ? (
                  <div className="py-6 text-center text-xs text-gray-400 font-sans tracking-wider">
                    Searching ELANTRAA Catalogue...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="py-2.5 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={56}
                          className="w-12 h-14 object-cover rounded bg-gray-100 border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-[#C9A648] transition-colors font-serif">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {item.categoryName}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.discountPrice ? (
                          <div className="space-x-1.5">
                            <span className="text-xs font-semibold text-[#C9A648]">
                              ₹{item.discountPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-gray-400 line-through">
                              ₹{item.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-gray-900">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500 font-sans">
                    No matching products found for &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
