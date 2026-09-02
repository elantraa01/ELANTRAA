"use client";

import Image from "next/image";
import Link from "next/link";

export default function BrandStory() {
  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] relative overflow-hidden border-t border-[#C9A648]/20">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-[#C9A648]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-[#C9A648]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Founder Image Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-[#C9A648]/30 group">
              <Image
                src="/images/founder/founder.jpg"
                alt="Elantraa Founder"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              
              {/* Gold Accent Frame Overlay */}
              <div className="absolute inset-3 border border-[#C9A648]/40 rounded-xl pointer-events-none" />

              {/* Caption Overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-1">
                  VISIONARY & FOUNDER
                </span>
                <p className="font-serif text-lg font-medium text-white tracking-wide">
                  Elantraa Haute Couture
                </p>
              </div>
            </div>
          </div>

          {/* Text & Tagline Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Header Badge */}
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-[1px] bg-[#C9A648]" />
              <span className="text-[#C9A648] text-xs font-serif uppercase tracking-[0.25em] font-semibold">
                MEET THE FOUNDER
              </span>
              <div className="w-8 h-[1px] bg-[#C9A648] lg:hidden" />
            </div>

            {/* Main Tagline */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 tracking-tight leading-tight">
                From Tradition to Trend
              </h2>
              <p className="text-[#C9A648] font-serif italic text-lg sm:text-xl font-light">
                &ldquo;Where rich Indian heritage meets modern effortless style.&rdquo;
              </p>
            </div>

            <div className="w-16 h-[2px] bg-[#C9A648]/40 mx-auto lg:mx-0 my-4" />

            {/* Founder Message / Brand Story */}
            <p className="text-gray-700 font-light leading-relaxed text-sm sm:text-base max-w-2xl mx-auto lg:mx-0">
              Elantraa was born from a passion to redefine ethnic and fusion wear for the modern woman. We believe traditional craftsmanship shouldn’t be reserved only for special occasions, and modern fashion should never lose its rich cultural roots.
            </p>

            <p className="text-gray-600 font-light leading-relaxed text-sm sm:text-base max-w-2xl mx-auto lg:mx-0">
              Each piece in our collection is thoughtfully designed to empower you with confidence, comfort, and distinction — taking you effortlessly from everyday moments to grand celebrations.
            </p>

            {/* Quote Box */}
            <div className="bg-white/80 backdrop-blur-sm border-l-4 border-[#C9A648] p-5 rounded-r-xl shadow-sm max-w-xl mx-auto lg:mx-0 text-left">
              <p className="text-sm font-serif italic text-gray-800 leading-relaxed">
                &ldquo;Fashion is more than what you wear — it&apos;s a celebration of your individuality and your story.&rdquo;
              </p>
              <p className="text-xs uppercase tracking-widest text-[#C9A648] font-semibold mt-2">
                — Founder & Creative Director, Elantraa
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white transition-all duration-300 font-medium text-xs tracking-[0.2em] uppercase rounded shadow-lg group"
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

