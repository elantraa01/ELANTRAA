"use client";

import Image from "next/image";
import Link from "next/link";

export default function BrandStory() {
  return (
    <section id="brand-story" className="py-20 sm:py-28 bg-[#171717] text-white relative overflow-hidden">
      {/* Background Decorative Gold Accent Ambient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C9A648]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C9A648]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image Collage */}
          <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-[#C9A648]/30">
            <Image
              src="/images/collections/ethnic.png"
              alt="ELANTRAA Heritage & Craftsmanship"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Quote Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
              <p className="text-xs sm:text-sm font-serif italic text-[#F3E5AB]">
                &ldquo;Fashion is not merely what we wear—it is an intimate statement of who we are.&rdquo;
              </p>
              <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-2">
                — ELANTRAA ATELIER, MUMBAI & MILAN
              </p>
            </div>
          </div>

          {/* Right Column: Story Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A648]/20 border border-[#C9A648]/40 rounded-full">
              <span className="text-[11px] tracking-[0.25em] text-[#D4AF37] uppercase font-semibold">
                OUR HERITAGE & PHILOSOPHY
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white leading-tight">
              Crafting Luxury with <br />
              <span className="italic bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent">
                Uncompromising Precision
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed font-sans">
              Founded on the pillars of haute couture excellence, ELANTRAA merges centuries-old Indian textile artistry with modern Milanese tailoring. Every silhouette is crafted from handpicked pure mulberry silks, organic linens, and hand-embroidered zari threads.
            </p>

            <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed font-sans">
              We reject mass production in favor of limited-edition drops, ensuring every garment you own remains rare, distinctive, and enduring.
            </p>

            {/* Key Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/15">
              <div>
                <h4 className="text-sm font-serif text-[#F3E5AB] uppercase tracking-wider">100% Handcrafted</h4>
                <p className="text-xs text-gray-400 mt-1 font-light">Woven by master artisans</p>
              </div>

              <div>
                <h4 className="text-sm font-serif text-[#F3E5AB] uppercase tracking-wider">Zero Waste</h4>
                <p className="text-xs text-gray-400 mt-1 font-light">Sustainably sourced fabrics</p>
              </div>

              <div>
                <h4 className="text-sm font-serif text-[#F3E5AB] uppercase tracking-wider">Bespoke Fit</h4>
                <p className="text-xs text-gray-400 mt-1 font-light">Tailored to perfection</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="#collections"
                className="inline-flex items-center text-xs tracking-[0.2em] uppercase text-[#D4AF37] hover:text-white font-semibold transition-colors group"
              >
                <span>Read Full Brand Story</span>
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
