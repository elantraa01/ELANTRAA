"use client";

import Image from "next/image";
import { MOCK_REVIEWS } from "./mockData";

export default function Testimonials() {
  const reviews = MOCK_REVIEWS;

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-[#FAF8F5] relative border-t border-b border-[#C9A648]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
            CLIENT TESTIMONIALS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mt-2 tracking-tight">
            Words From Our Patrons
          </h2>
          <p className="text-sm text-gray-600 font-light mt-2 font-sans">
            Hear what discerning clients around the globe say about our haute couture pieces and bespoke concierge service.
          </p>
          <div className="w-12 h-[2px] bg-[#C9A648] mx-auto mt-4" />
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 hover:border-[#C9A648]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Star Rating & Verified Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-[#D4AF37]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                  {rev.verifiedBuyer && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-medium tracking-wider rounded border border-emerald-200">
                      ✓ Verified Patron
                    </span>
                  )}
                </div>

                <h3 className="text-base font-serif font-medium text-gray-900 mb-2">
                  &ldquo;{rev.title}&rdquo;
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed font-sans mb-6">
                  {rev.comment}
                </p>
              </div>

              {/* Customer Profile Header */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                {rev.userAvatar ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C9A648]/40 shrink-0">
                    <Image
                      src={rev.userAvatar}
                      alt={rev.userName}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#171717] text-[#D4AF37] flex items-center justify-center text-xs font-serif font-bold shrink-0">
                    {rev.userName.charAt(0)}
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-gray-900 font-sans">
                    {rev.userName}
                  </h4>
                  {rev.userLocation && (
                    <p className="text-[10px] text-gray-400 font-light font-sans">
                      {rev.userLocation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
