"use client";

import Link from "next/link";

interface ShopHeaderProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  matchingCount: number;
  totalCount: number;
  activeFiltersCount: number;
  onOpenMobileFilters: () => void;
}

export default function ShopHeader({
  sortBy,
  onSortChange,
  matchingCount,
  totalCount,
  activeFiltersCount,
  onOpenMobileFilters,
}: ShopHeaderProps) {
  return (
    <div className="mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-light mb-4 uppercase tracking-widest overflow-hidden">
        <Link href="/" className="hover:text-[#C9A648] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">Shop Catalogue</span>
      </nav>

      {/* Header Banner Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6">
        <div className="min-w-0">
          <span className="block text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold break-words">
            EXPLORE THE COLLECTION
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mt-1 tracking-tight break-words">
            Haute Couture Shop
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-light mt-2 md:mt-0">
          Showing <strong className="font-semibold text-gray-900">{matchingCount}</strong> of {totalCount} luxury creations
        </p>
      </div>

      {/* Controls Bar: Mobile Filter Toggle + Desktop Sorting */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {/* Mobile Filter Button */}
        <button
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded text-xs font-medium uppercase tracking-wider text-gray-800 hover:border-[#C9A648] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 text-[#C9A648]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-[#C9A648] text-white text-[10px] font-bold rounded-full ml-1">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="hidden lg:block text-xs text-gray-500 uppercase tracking-widest font-medium">
          Haute Couture Catalogue
        </div>

        {/* Sort Select */}
        <div className="flex min-w-0 flex-1 sm:flex-none items-center gap-3 sm:ml-auto">
          <label htmlFor="sort" className="text-xs uppercase tracking-widest text-gray-500 font-medium whitespace-nowrap">
            Sort By:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="min-w-0 max-w-full flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-300 rounded text-xs text-gray-800 uppercase tracking-wider font-medium focus:outline-none focus:border-[#C9A648] cursor-pointer shadow-sm"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popularity">Popularity / Top Rated</option>
          </select>
        </div>
      </div>
      </div>
    </div>
  );
}
