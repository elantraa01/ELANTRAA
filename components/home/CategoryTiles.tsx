"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MOCK_COLLECTIONS } from "./mockData";

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentCategoryId?: string | null;
  subcategories?: DbCategory[];
}

export default function CategoryTiles() {
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setDbCategories(data.categories);
          }
        }
      } catch (err) {
        console.warn("Failed to load real categories for CategoryTiles", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Filter root categories if parentCategoryId exists, or show top categories
  const rootCategories = dbCategories.filter((cat) => !cat.parentCategoryId);
  const categoriesToDisplay = rootCategories.length > 0 ? rootCategories : dbCategories;

  // Image mapper for real categories missing explicit image URLs
  const getCategoryImage = (catName: string, customImage?: string | null) => {
    if (customImage && customImage.trim() !== "") return customImage;
    const nameLower = catName.toLowerCase();

    if (nameLower.includes("women") || nameLower.includes("couture") || nameLower.includes("saree") || nameLower.includes("gown") || nameLower.includes("dress")) {
      return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80";
    }
    if (nameLower.includes("men") || nameLower.includes("suit") || nameLower.includes("sherwani") || nameLower.includes("blazer")) {
      return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80";
    }
    if (nameLower.includes("access") || nameLower.includes("bag") || nameLower.includes("jewel") || nameLower.includes("watch")) {
      return "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80";
    }
    if (nameLower.includes("sale") || nameLower.includes("offer") || nameLower.includes("discount")) {
      return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80";
    }

    return "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80";
  };

  // Convert real DB categories into tile format or use default MOCK_COLLECTIONS fallback
  const tiles =
    categoriesToDisplay.length > 0
      ? categoriesToDisplay.map((cat) => {
          const subCount = cat.subcategories ? cat.subcategories.length : 0;
          return {
            id: cat.id,
            title: cat.name,
            subtitle: subCount > 0 ? `${subCount} Subcategories` : "Explore Curated Catalogue",
            slug: cat.slug,
            image: getCategoryImage(cat.name, cat.image),
            itemCount: `Discover ${cat.name}`,
            targetUrl: `/shop?category=${encodeURIComponent(cat.name)}`,
          };
        })
      : MOCK_COLLECTIONS;

  return (
    <section id="category-tiles" className="py-14 sm:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
            VISUAL SHORTCUTS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mt-2 tracking-tight">
            Explore By Category
          </h2>
          <div className="w-12 h-[2px] bg-[#C9A648] mx-auto mt-4" />
        </div>

        {/* Dynamic Category Tiles Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(Math.max(tiles.length, 2), 4)} gap-4 sm:gap-6`}>
          {tiles.map((tile) => (
            <Link
              key={tile.id}
              href={tile.targetUrl || `/category/${tile.slug}`}
              className="group relative h-80 sm:h-96 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-end border border-gray-100"
            >
              {/* Background Image */}
              <Image
                src={tile.image}
                alt={tile.title}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent group-hover:from-black/90 transition-all duration-300" />

              {/* Gold Border Highlight on Hover */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C9A648]/80 transition-all duration-500 rounded-xl pointer-events-none" />

              {/* Content Box */}
              <div className="relative z-10 p-4 sm:p-6 text-white transform group-hover:-translate-y-1 transition-transform duration-300">
                <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#171717]/80 backdrop-blur-sm border border-[#C9A648]/40 text-[#D4AF37] text-[9px] sm:text-[10px] uppercase tracking-widest rounded mb-2 font-medium">
                  {tile.itemCount}
                </span>

                <h3 className="text-xl sm:text-2xl font-serif tracking-wide text-white group-hover:text-[#F3E5AB] transition-colors">
                  {tile.title}
                </h3>

                <p className="text-[11px] sm:text-xs text-gray-300 mt-1 font-light line-clamp-1 font-sans">
                  {tile.subtitle}
                </p>

                <div className="mt-4 flex items-center text-[10px] sm:text-xs text-[#D4AF37] font-medium tracking-widest uppercase group-hover:translate-x-1.5 transition-transform">
                  <span>Shop Collection</span>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
