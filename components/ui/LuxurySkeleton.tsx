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
