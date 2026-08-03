"use client";

import Image from "next/image";

export default function BrandStory() {
  return (
    <section id="brand-story" className="py-12 sm:py-16 bg-[#171717] text-white relative overflow-hidden">
      {/* Subtle Ambient Gold Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#C9A648]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#C9A648]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 1 Compact Image with Quote Overlay */}
          <div className="lg:col-span-5 relative aspect-[16/10] sm:aspect-[4/3] lg:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-[#C9A648]/30 group">
            <Image
              src="/images/elantraa/insta.png"
              alt="ELANTRAA Atelier Heritage"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* 1-Line Quote Overlay */}
            <div className="absolute bottom-4 left-4 right-4 p-3 sm:p-4 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg">
              <p className="text-xs font-serif italic text-[#F3E5AB] leading-snug">
                &ldquo;Fashion is not merely what we wear—it is an intimate statement of who we are.&rdquo;
              </p>
              <p className="text-[9px] text-gray-300 uppercase tracking-widest mt-1 font-sans">
                — ELANTRAA ATELIER, MUMBAI & MILAN
              </p>
            </div>
          </div>

          {/* Right Column: Story Text & 3 Trust Icons */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A648]/20 border border-[#C9A648]/40 rounded-full">
              <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#D4AF37] uppercase font-semibold">
                OUR HERITAGE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white leading-tight">
              Crafting Luxury with{" "}
              <span className="italic bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent">
                Uncompromising Precision
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed font-sans max-w-2xl">
              Founded on the pillars of haute couture excellence, ELANTRAA merges centuries-old Indian textile artistry with modern Milanese tailoring. Every silhouette is crafted from handpicked pure mulberry silks and organic linens in limited-edition drops.
            </p>

            {/* 3 Trust Icons Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-8 h-8 rounded-full bg-[#C9A648]/20 border border-[#C9A648]/40 flex items-center justify-center text-[#D4AF37] text-sm mb-1">
                  ✦
                </div>
                <h4 className="text-xs font-serif text-[#F3E5AB] uppercase tracking-wider">Handcrafted</h4>
                <p className="text-[10px] text-gray-400 font-light mt-0.5">Woven by master artisans</p>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-8 h-8 rounded-full bg-[#C9A648]/20 border border-[#C9A648]/40 flex items-center justify-center text-[#D4AF37] text-sm mb-1">
                  🌿
                </div>
                <h4 className="text-xs font-serif text-[#F3E5AB] uppercase tracking-wider">Zero Waste</h4>
                <p className="text-[10px] text-gray-400 font-light mt-0.5">100% sustainable silks</p>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="w-8 h-8 rounded-full bg-[#C9A648]/20 border border-[#C9A648]/40 flex items-center justify-center text-[#D4AF37] text-sm mb-1">
                  ✂
                </div>
                <h4 className="text-xs font-serif text-[#F3E5AB] uppercase tracking-wider">Bespoke Fit</h4>
                <p className="text-[10px] text-gray-400 font-light mt-0.5">Tailored to perfection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
