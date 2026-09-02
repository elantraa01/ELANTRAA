"use client";

import Image from "next/image";
import Link from "next/link";

export default function BrandStory() {
  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F5] relative overflow-hidden border-t border-[#C9A648]/20">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-[#C9A648]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-[#C9A648]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Founder Image Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-[#C9A648]/30 group">
              <Image
                src="/images/founder/founder.jpg"
                alt="Elantraa Founder"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 35vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              
              {/* Gold Accent Frame Overlay */}
              <div className="absolute inset-3 border border-[#C9A648]/40 rounded-lg pointer-events-none" />

              {/* Caption Overlay */}
              <div className="absolute bottom-4 left-5 right-5 text-white text-left">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-0.5">
                  VISIONARY & FOUNDER
                </span>
                <p className="font-serif text-base font-medium text-white tracking-wide">
                  Elantraa
                </p>
              </div>
            </div>
          </div>

          {/* Text & Tagline Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Header Badge */}
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-[1px] bg-[#C9A648]" />
              <span className="text-[#C9A648] text-xs font-serif uppercase tracking-[0.25em] font-semibold">
                MEET THE FOUNDER
              </span>
              <div className="w-8 h-[1px] bg-[#C9A648] lg:hidden" />
            </div>

            {/* Main Tagline */}
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 tracking-tight leading-tight">
                From Tradition to Trend
              </h2>
              <p className="text-[#C9A648] font-serif italic text-base sm:text-lg font-light">
                &ldquo;Where rich Indian heritage meets modern effortless style.&rdquo;
              </p>
            </div>

            {/* Shortened Founder Message */}
            <p className="text-gray-700 font-light leading-relaxed text-sm sm:text-base max-w-xl mx-auto lg:mx-0">
              Elantraa brings together the timeless charm of traditional Indian craftsmanship with the ease of contemporary fashion — created for the woman who wants to feel effortlessly stylish for every occasion.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-7 py-3 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white transition-all duration-300 font-medium text-xs tracking-[0.2em] uppercase rounded shadow-md group"
              >
                <span>Read Our Full Story</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
