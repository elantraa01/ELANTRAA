"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/home/ProductCard";
import QuickViewModal from "@/components/home/QuickViewModal";
import { Product, MOCK_PRODUCTS } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";

const CATEGORY_META: Record<
  string,
  { title: string; subtitle: string; description: string; bannerImage: string }
> = {
  women: {
    title: "Women's Collection",
    subtitle: "HAUTE COUTURE & EVENING WEAR",
    description:
      "Handcrafted gowns, silk sarees, tailored jackets, and luxurious evening wear crafted from the finest organic Mulberry silk and organza.",
    bannerImage: "/images/collections/dresses.png",
  },
  men: {
    title: "Men's Collection",
    subtitle: "TAILORED MENSWEAR & ETHNIC COUTURE",
    description:
      "Impeccably tailored suits, classic Oxford shirts, and regal embroidered kurta sets designed for the modern gentleman.",
    bannerImage: "/images/collections/menswear.png",
  },
  accessories: {
    title: "Luxury Accessories",
    subtitle: "STATEMENT HANDBAGS & FINE JEWELRY",
    description:
      "Sculptural handbags, handcrafted leather belts, and heirloom jewelry designed to elevate every silhouette.",
    bannerImage: "/images/collections/dresses.png",
  },
  "new-arrivals": {
    title: "New Arrivals",
    subtitle: "THE LATEST HAUS COUTURE ADDITIONS",
    description:
      "Be the first to explore ELANTRAA's newest seasonal drops, handcrafted with innovative silhouettes and golden accents.",
    bannerImage: "/images/hero/hero_fashion.png",
  },
  sale: {
    title: "Exclusive Sale",
    subtitle: "PRIVILEGE SAVINGS UP TO 40% OFF",
    description:
      "Complimentary access to limited-edition haute couture pieces with exclusive seasonal privilege pricing.",
    bannerImage: "/images/collections/ethnic.png",
  },
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const categorySlug = params.slug.toLowerCase();
  const meta = CATEGORY_META[categorySlug] || {
    title: `${params.slug.toUpperCase()} Collection`,
    subtitle: "ELANTRAA LUXURY SELECTION",
    description: "Explore bespoke fashion pieces curated exclusively by ELANTRAA.",
    bannerImage: "/images/hero/hero_fashion.png",
  };

  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?category=${categorySlug}&sortBy=${sortBy}`);
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          } else {
            // Fallback filtering over MOCK_PRODUCTS for demo if DB is empty
            let filtered = MOCK_PRODUCTS;
            if (categorySlug === "women") {
              filtered = MOCK_PRODUCTS.filter((p) =>
                ["dresses", "ethnic", "sarees"].includes(p.category.toLowerCase())
              );
            } else if (categorySlug === "men") {
              filtered = MOCK_PRODUCTS.filter(
                (p) => p.category.toLowerCase() === "menswear"
              );
            } else if (categorySlug === "new-arrivals") {
              filtered = MOCK_PRODUCTS.filter((p) => p.isNewArrival);
            } else if (categorySlug === "sale") {
              filtered = MOCK_PRODUCTS.filter((p) => p.discountPrice !== null);
            }
            setProducts(filtered);
          }
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch {
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryProducts();
  }, [categorySlug, sortBy]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 px-5 py-3 rounded-lg shadow-2xl text-xs font-medium uppercase tracking-wider flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
            <span>&#10022;</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-[#C9A648] transition-colors">
                Shop
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium capitalize">{meta.title}</span>
            </nav>
          </div>
        </div>

        {/* Category Hero Banner */}
        <div className="relative bg-[#171717] text-white py-16 sm:py-24 overflow-hidden border-b border-[#C9A648]/30">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <Image src={meta.bannerImage} alt="" fill className="object-cover" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs tracking-[0.3em] text-[#D4AF37] uppercase font-bold">
              {meta.subtitle}
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif text-white mt-2 tracking-tight">
              {meta.title}
            </h1>
            <p className="text-sm text-gray-300 font-light max-w-2xl mx-auto mt-3 leading-relaxed">
              {meta.description}
            </p>
          </div>
        </div>

        {/* Category Products Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Showing {products.length} {meta.title}
            </span>

            {/* Sort Control */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-500 font-light uppercase tracking-wider hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "price-low" | "price-high")}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-gray-300 rounded text-xs font-medium focus:outline-none focus:border-[#C9A648]"
              >
                <option value="newest">Newest Additions</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setSelectedProduct(p)}
                  onAddToCart={(p) => {
                    addItem(p);
                    showNotification(`Added ${p.name} to your shopping bag.`);
                  }}
                  onToggleWishlist={(p) => showNotification(`Saved ${p.name} to wishlist.`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#FAF8F5] rounded-2xl border border-dashed border-gray-300 p-8">
              <h3 className="text-2xl font-serif text-gray-900 font-semibold mb-2">
                No items currently found in this category
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Explore our full catalogue for latest collections.
              </p>
              <Link
                href="/shop"
                className="inline-block px-8 py-3 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-widest rounded"
              >
                View Full Shop
              </Link>
            </div>
          )}
        </main>
      </div>

      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => {
          addItem(p);
          showNotification(`Added ${p.name} to shopping bag.`);
        }}
      />

      <Footer />
    </div>
  );
}
