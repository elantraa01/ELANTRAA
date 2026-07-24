"use client";

export interface FilterState {
  category: string;
  sizes: string[];
  colors: string[];
  maxPrice: number;
  minRating: number;
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

const DEFAULT_CATEGORIES = ["All", "Dresses", "Tops", "Shirts", "Outerwear", "Ethnic", "Accessories"];
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "38", "One Size"];
const AVAILABLE_COLORS = [
  { name: "Champagne", hex: "#F7E7CE" },
  { name: "Ivory", hex: "#FAFAFA" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Stone", hex: "#877F7D" },
  { name: "Olive", hex: "#556B2F" },
  { name: "Pearl", hex: "#EAE6DF" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Blush", hex: "#FFB6C1" },
  { name: "Sage", hex: "#9CAF88" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Khaki", hex: "#C3B091" },
  { name: "Navy", hex: "#000080" },
];

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
      ? ["All", ...categoriesList.filter((c, idx, self) => self.indexOf(c) === idx)]
      : DEFAULT_CATEGORIES;
  const toggleSize = (size: string) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ ...filters, sizes: next });
  };

  const toggleColor = (color: string) => {
    const next = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ ...filters, colors: next });
  };

  const activeFiltersCount =
    (filters.category !== "All" ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    (filters.maxPrice < 6000 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

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
          {categoriesToDisplay.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange({ ...filters, category: cat })}
              className={`w-full flex items-center justify-between py-1.5 text-xs tracking-wider transition-colors ${
                filters.category === cat
                  ? "text-[#C9A648] font-bold pl-2 border-l-2 border-[#C9A648]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>{cat}</span>
              {cat === "All" && (
                <span className="text-[10px] text-gray-400">({totalProductsCount})</span>
              )}
            </button>
          ))}
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
          min="2000"
          max="6000"
          step="250"
          value={filters.maxPrice}
          onChange={(e) =>
            onFilterChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-[#C9A648] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-sans">
          <span>&#8377;2,000</span>
          <span>&#8377;6,000</span>
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-3">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIZES.map((size) => {
            const isSelected = filters.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-all ${
                  isSelected
                    ? "bg-[#171717] text-[#D4AF37] border-[#171717] shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-3">
          Color
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_COLORS.map((c) => {
            const isSelected = filters.colors.includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() => toggleColor(c.name)}
                className={`flex items-center space-x-2 p-1.5 rounded text-xs transition-all ${
                  isSelected
                    ? "bg-[#C9A648]/10 text-[#C9A648] font-semibold border border-[#C9A648]"
                    : "text-gray-600 hover:text-gray-900 border border-transparent"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-1.5">
          {[
            { label: "All Ratings", value: 0 },
            { label: "4.8 ★ & above", value: 4.8 },
            { label: "4.5 ★ & above", value: 4.5 },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => onFilterChange({ ...filters, minRating: r.value })}
              className={`w-full text-left py-1 text-xs tracking-wider transition-colors ${
                filters.minRating === r.value
                  ? "text-[#C9A648] font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r.label}
            </button>
          ))}
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
