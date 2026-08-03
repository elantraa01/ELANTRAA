"use client";

import Image from "next/image";
import Link from "next/link";

export default function EditorialCollection() {
  return (
    <section id="editorial-collection" className="py-14 sm:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl min-h-[420px] sm:min-h-[480px] flex items-center border border-[#C9A648]/30 group">
          {/* Background Lookbook Image */}
          <Image
            src="/images/EDITORIAL CURATION/Screenshot 2026-08-03 224014.png"
            alt="EDITORIAL CURATION Lookbook"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
            sizes="100vw"
          />

          {/* Dark Luxury Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent sm:w-3/4" />

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-[#D4AF37]/50 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[10px] sm:text-xs tracking-[0.2em] text-[#F3E5AB] uppercase font-medium">
                EDITORIAL CURATION
              </span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-serif tracking-tight font-light leading-tight mb-4">
              The Mulberry <br />
              <span className="italic font-normal bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent">
                Silk Edit
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed mb-8 font-sans">
              Handcrafted from 100% pure Mulberry silk. Discover luminous luster, featherlight drape, and hand-stitched detailing tailored for memorable soirées.
            </p>

            <Link
              href="/shop?category=Women"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white font-medium text-xs tracking-[0.2em] uppercase rounded shadow-lg hover:shadow-[#C9A648]/40 hover:scale-[1.02] transition-all duration-300 group/btn"
            >
              <span>Explore The Silk Edit</span>
              <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
