"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/home/ProductCard";
import QuickViewModal from "@/components/home/QuickViewModal";
import FilterSidebar, { FilterState } from "@/components/shop/FilterSidebar";
import ShopHeader from "@/components/shop/ShopHeader";
import { MOCK_PRODUCTS, Product } from "@/components/home/mockData";
import { useCart } from "@/context/CartContext";

const DEFAULT_FILTERS: FilterState = {
  category: "All",
  sizes: [],
  colors: [],
  maxPrice: 6000,
  minRating: 0,
};

function getFilteredProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter((product) => {
    if (
      filters.category !== "All" &&
      product.category.toLowerCase() !== filters.category.toLowerCase()
    ) {
      return false;
    }
    const effectivePrice = product.discountPrice || product.price;
    if (effectivePrice > filters.maxPrice) {
      return false;
    }
    if (filters.minRating > 0 && product.rating < filters.minRating) {
      return false;
    }
    if (
      filters.sizes.length > 0 &&
      !product.sizes.some((s) => filters.sizes.includes(s))
    ) {
      return false;
    }
    if (
      filters.colors.length > 0 &&
      !product.colors.some((c) => filters.colors.includes(c))
    ) {
      return false;
    }
    return true;
  });
}

function getSortedProducts(products: Product[], sortBy: string): Product[] {
  const list = [...products];
  if (sortBy === "price-low") {
    return list.sort(
      (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
    );
  }
  if (sortBy === "price-high") {
    return list.sort(
      (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
    );
  }
  if (sortBy === "popularity") {
    return list.sort((a, b) => b.rating - a.rating);
  }
  return list.sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
}

export default function ShopPage() {
  const { addItem } = useCart();
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Read URL query parameter for category (e.g. /shop?category=Dresses)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam) {
        setFilters((prev) => ({ ...prev, category: catParam }));
      }
    }
  }, []);

  // Fetch real PostgreSQL products and categories via API
  useEffect(() => {
    async function loadShopData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          if (data.products && data.products.length > 0) {
            setDbProducts(data.products);
          } else {
            setDbProducts(MOCK_PRODUCTS);
          }
        } else {
          setDbProducts(MOCK_PRODUCTS);
        }

        if (catRes.ok) {
          const data = await catRes.json();
          if (data.categories && data.categories.length > 0) {
            setDbCategories(data.categories.map((c: { name: string }) => c.name));
          }
        }
      } catch {
        setDbProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    loadShopData();
  }, []);

  const allProducts = dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    showNotification(`Added ${product.name} to your shopping bag.`);
  };

  const handleToggleWishlist = (product: Product) => {
    showNotification(`Saved ${product.name} to your wishlist.`);
  };

  const filteredProducts = useMemo(() => {
    return getFilteredProducts(allProducts, filters);
  }, [allProducts, filters]);

  const finalProducts = useMemo(() => {
    return getSortedProducts(filteredProducts, sortBy);
  }, [filteredProducts, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "All") count++;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.maxPrice < 6000) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 px-5 py-3 rounded-lg shadow-2xl text-xs font-medium uppercase tracking-wider flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
          <span>&#10022;</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <Navbar />

      {/* Hero Header */}
      <ShopHeader
        sortBy={sortBy}
        onSortChange={setSortBy}
        matchingCount={finalProducts.length}
        totalCount={allProducts.length}
        activeFiltersCount={activeFilterCount}
        onOpenMobileFilters={() => setMobileFiltersOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Grid Layout: Desktop Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              totalProductsCount={allProducts.length}
              matchingProductsCount={finalProducts.length}
              categoriesList={dbCategories}
            />
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-gray-100 rounded-xl" />
                ))}
              </div>
            ) : finalProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                {finalProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setSelectedProduct(p)}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#FAF8F5] rounded-2xl border border-dashed border-gray-300 p-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-serif text-gray-900 font-semibold mb-1">
                  No products match your active filters
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Try clearing your size, color, or price range selections.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-widest rounded"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Collapsible Filter Drawer */}
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        totalProductsCount={allProducts.length}
        matchingProductsCount={finalProducts.length}
        categoriesList={dbCategories}
        isMobileDrawer={mobileFiltersOpen}
        onCloseMobileDrawer={() => setMobileFiltersOpen(false)}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <Footer />
    </div>
  );
}
