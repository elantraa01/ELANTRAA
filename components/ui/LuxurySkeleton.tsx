"use client";

import Image from "next/image";

/**
 * Minimal Brand Logo Center Loader
 * Displays only the ELANTRAA logo in the center with a clean, subtle pulse (no golden background effects).
 */
export function LogoShimmer({ size = "md" }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const dimensions = {
    sm: { box: "w-14 h-14", logo: 44 },
    md: { box: "w-20 h-20", logo: 64 },
    lg: { box: "w-28 h-28", logo: 88 },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center select-none py-8">
      <div className={`relative ${dimensions.box} flex items-center justify-center`}>
        {/* Subtle, clean spinner ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-[#C9A648] animate-spin" />
        
        {/* Centered Brand Logo */}
        <div className="relative z-10 p-2 flex items-center justify-center">
          <Image
            src="/images/logo/logo.png"
            alt="Logo"
            width={dimensions.logo}
            height={dimensions.logo}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Clean Product Grid Loading Placeholder (Centered Logo only)
 */
export function ProductGridSkeleton() {
  return (
    <div className="w-full min-h-[380px] flex items-center justify-center">
      <LogoShimmer size="md" />
    </div>
  );
}

/**
 * Clean Product Detail Loading Placeholder (Centered Logo only)
 */
export function ProductDetailSkeleton() {
  return (
    <div className="w-full min-h-[50vh] flex items-center justify-center">
      <LogoShimmer size="lg" />
    </div>
  );
}

/**
 * Full Page Centered Minimal Logo Loader
 */
export function FullPageLoadingSkeleton() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LogoShimmer size="lg" />
    </div>
  );
}

/**
 * Luxury Home Product Section Skeleton
 * Prevents layout shift and prevents lower sections (e.g. Founder image)
 * from jumping to the top of the viewport before products finish loading.
 */
export function HomeProductSectionSkeleton() {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] relative border-t border-b border-[#C9A648]/15 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171717] text-[#D4AF37] border border-[#C9A648]/40 rounded-full mb-3 text-[10px] sm:text-xs font-medium uppercase tracking-widest animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648] animate-ping" />
              <span>CURATING COLLECTION</span>
              <span>•</span>
              <span>ELANTRAA ATELIER</span>
            </div>
            <div className="h-9 sm:h-11 w-64 bg-gray-200/80 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-80 max-w-full bg-gray-200/60 rounded animate-pulse" />
          </div>

          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-white/80 rounded-full border border-[#C9A648]/20 shadow-sm">
            <div className="relative w-4 h-4 animate-spin">
              <div className="w-full h-full rounded-full border-2 border-gray-200 border-t-[#C9A648]" />
            </div>
            <span className="text-xs text-gray-600 font-serif tracking-wider">
              Loading bespoke pieces...
            </span>
          </div>
        </div>

        {/* 4 Cards Skeleton Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 animate-pulse overflow-hidden flex items-center justify-center">
                <div className="text-center opacity-30 select-none">
                  <span className="font-serif text-base sm:text-lg tracking-[0.3em] text-[#C9A648] font-bold block">
                    ELANTRAA
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-gray-400">
                    HAUTE COUTURE
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
