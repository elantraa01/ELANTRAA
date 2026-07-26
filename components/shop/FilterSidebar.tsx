"use client";

export interface FilterState {
  category: string;
  sizes?: string[];
  colors?: string[];
  maxPrice: number;
  minRating?: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalProductsCount: number;
  matchingProductsCount: number;
  categoriesList?: string[];
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  totalProductsCount,
  matchingProductsCount,
  categoriesList,
  isMobileDrawer,
  onCloseMobileDrawer,
}: FilterSidebarProps) {
  const categoriesToDisplay =
    categoriesList && categoriesList.length > 0
      ? ["All", ...Array.from(new Set(categoriesList))]
      : ["All"];

  const activeFiltersCount =
    (filters.category !== "All" ? 1 : 0) +
    ((filters.sizes?.length || 0)) +
    ((filters.colors?.length || 0)) +
    (filters.maxPrice < 20000 ? 1 : 0) +
    ((filters.minRating && filters.minRating > 0) ? 1 : 0);

  const sidebarContent = (
    <div className="space-y-8">
      {/* Sidebar Top / Active Filters Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-serif uppercase tracking-widest text-gray-900 font-semibold">
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-[#C9A648] text-white text-[10px] font-bold rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="text-xs text-[#C9A648] hover:text-gray-900 font-medium underline uppercase tracking-wider"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-3">
          Category
        </h4>
        <div className="space-y-2">
          {categoriesToDisplay.map((cat) => {
            const isCatActive =
              filters.category === cat ||
              (cat !== "All" &&
                (filters.category || "").toLowerCase().replace(/[^a-z0-9]/g, "") ===
                  cat.toLowerCase().replace(/[^a-z0-9]/g, ""));
            return (
              <button
                key={cat}
                onClick={() => onFilterChange({ ...filters, category: cat })}
                className={`w-full flex items-center justify-between py-1.5 text-xs tracking-wider transition-colors ${
                  isCatActive
                    ? "text-[#C9A648] font-bold pl-2 border-l-2 border-[#C9A648]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>{cat}</span>
                {cat === "All" && (
                  <span className="text-[10px] text-gray-400">({totalProductsCount})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-800">
            Max Price
          </h4>
          <span className="text-xs font-semibold text-[#C9A648]">
            &#8377;{filters.maxPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="20000"
          step="500"
          value={filters.maxPrice}
          onChange={(e) =>
            onFilterChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-[#C9A648] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-sans">
          <span>&#8377;1,000</span>
          <span>&#8377;20,000</span>
        </div>
      </div>
    </div>
  );

  // If component is explicitly used as a mobile drawer:
  if (isMobileDrawer !== undefined) {
    if (!isMobileDrawer) return null; // Closed drawer renders nothing
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
        <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <span className="text-lg font-serif tracking-widest text-gray-900 uppercase">
                Filter Products
              </span>
              <button
                onClick={onCloseMobileDrawer}
                className="p-2 text-gray-500 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  onResetFilters();
                  onCloseMobileDrawer?.();
                }}
                className="py-3 px-4 bg-gray-100 text-gray-700 text-xs uppercase tracking-widest font-medium rounded hover:bg-gray-200"
              >
                Reset
              </button>
            )}
            <button
              onClick={onCloseMobileDrawer}
              className="flex-1 py-3 bg-[#171717] text-[#D4AF37] text-xs uppercase tracking-widest font-medium rounded hover:bg-[#C9A648] hover:text-white transition-colors"
            >
              Show Results ({matchingProductsCount})
            </button>
          </div>
        </div>
        <div className="flex-1" onClick={onCloseMobileDrawer} />
      </div>
    );
  }

  // Desktop inline sidebar rendering
  return <aside className="w-full font-sans">{sidebarContent}</aside>;
}
