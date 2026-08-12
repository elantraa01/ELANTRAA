"use client";

import Image from "next/image";

/**
 * Brand Logo Shimmer Loader
 * Displays the ELANTRAA emblem logo with a pulsing gold glow and shimmering aura in the middle.
 */
export function LogoShimmer({ size = "md", label }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const dimensions = {
    sm: { box: "w-14 h-14", logo: 40 },
    md: { box: "w-24 h-24", logo: 68 },
    lg: { box: "w-32 h-32", logo: 96 },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-4 select-none">
      <div className={`relative ${dimensions.box} rounded-full flex items-center justify-center bg-white shadow-2xl border-2 border-[#C9A648]/60 p-3 overflow-hidden backdrop-blur-md`}>
        {/* Pulsing Outer Gold Rings */}
        <span className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#D4AF37]/40 via-[#C9A648]/50 to-[#AA771C]/40 animate-ping opacity-60 pointer-events-none" />
        
        {/* Inner Shimmer Overlay */}
        <div className="absolute inset-0 animate-shimmer opacity-50 rounded-full" />

        {/* Centered ELANTRAA Logo Image */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <Image
            src="/images/logo/logo.png"
            alt="ELANTRAA Logo"
            width={dimensions.logo}
            height={dimensions.logo}
            className="object-contain drop-shadow-lg animate-pulse"
            priority
          />
        </div>
      </div>

      {label && (
        <span className="text-[11px] uppercase tracking-[0.3em] font-serif font-bold text-[#9b7a1d] animate-pulse drop-shadow-sm">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Skeleton placeholder for individual Product Cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between p-3 space-y-3 animate-in fade-in duration-300">
      {/* Product Image Placeholder */}
      <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden animate-shimmer">
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-white/60 backdrop-blur-sm" />
      </div>

      {/* Product Info Lines */}
      <div className="space-y-2 pt-1">
        <div className="h-3 w-1/3 rounded bg-gray-200 animate-shimmer" />
        <div className="h-4 w-3/4 rounded bg-gray-200 animate-shimmer" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-20 rounded bg-amber-100 animate-shimmer" />
          <div className="h-7 w-20 rounded-md bg-gray-200 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of Product Card Skeletons with Centered Logo Watermark Overlay
 */
export function ProductGridSkeleton({ count = 8, label = "EXPLORING CATALOGUE..." }: { count?: number; label?: string }) {
  return (
    <div className="relative w-full min-h-[400px]">
      {/* Centered Logo Shimmer Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white/90 backdrop-blur-md px-8 py-6 rounded-2xl shadow-2xl border border-[#C9A648]/40 flex flex-col items-center animate-in zoom-in-95 duration-300">
          <LogoShimmer size="md" label={label} />
        </div>
      </div>

      {/* Background Shimmer Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full opacity-60">
        {Array.from({ length: count }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

/**
 * Complete Product Detail Page Skeleton with Centered Logo
 */
export function ProductDetailSkeleton() {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full animate-in fade-in duration-300">
      {/* Centered Logo Overlay */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/90 backdrop-blur-md px-10 py-6 rounded-2xl shadow-xl border border-[#C9A648]/30">
          <LogoShimmer size="md" label="LOADING COUTURE DETAILS..." />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start opacity-70">
        {/* Left: Gallery Skeleton */}
        <div className="flex flex-col-reverse lg:flex-row gap-4">
          <div className="flex lg:flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg animate-shimmer shrink-0" />
            ))}
          </div>
          <div className="relative flex-1 aspect-[3/4] rounded-2xl animate-shimmer border border-gray-100" />
        </div>

        {/* Right: Info Skeleton */}
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-amber-200/60 animate-shimmer" />
            <div className="h-8 w-3/4 rounded bg-gray-200 animate-shimmer" />
            <div className="h-6 w-32 rounded bg-amber-100 animate-shimmer" />
          </div>

          <div className="h-20 w-full rounded-xl bg-gray-100 animate-shimmer" />

          {/* Size Picker Skeleton */}
          <div className="space-y-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-12 h-10 rounded-md bg-gray-200 animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="space-y-3 pt-4">
            <div className="h-14 w-full rounded-lg bg-gradient-to-r from-[#D4AF37]/50 via-[#C9A648]/60 to-[#AA771C]/50 animate-shimmer" />
            <div className="h-12 w-full rounded-lg bg-gray-200 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Full Page Centered Loading State with Logo
 */
export function FullPageLoadingSkeleton({ label = "Loading ELANTRAA..." }: { label?: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <LogoShimmer size="lg" label={label} />
      <div className="w-48 h-1.5 rounded-full bg-gray-200 overflow-hidden mt-4 shadow-inner">
        <div className="w-full h-full bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] animate-shimmer" />
      </div>
    </div>
  );
}
