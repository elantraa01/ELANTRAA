"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MOCK_COLLECTIONS } from "./mockData";

export interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  slug: string;
  itemCount: string;
  targetUrl?: string;
}

export default function FeaturedCollections() {
  const [collections, setCollections] = useState<CollectionItem[]>(MOCK_COLLECTIONS);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch("/api/collections");
        if (res.ok) {
          const data = await res.json();
          if (data.collections && data.collections.length > 0) {
            setCollections(data.collections);
          }
        }
      } catch (err) {
        console.warn("Failed to load DB collections, using mock", err);
      }
    }
    fetchCollections();
  }, []);

  return (
    <section id="collections" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
            CURATED SELECTION
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mt-2 tracking-tight">
            Featured Collections
          </h2>
          <div className="w-12 h-[2px] bg-[#C9A648] mx-auto mt-4" />
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {collections.map((collection) => {
            const destinationUrl =
              collection.targetUrl && collection.targetUrl.trim() !== ""
                ? collection.targetUrl
                : `/shop?category=${encodeURIComponent(collection.title)}`;

            return (
              <Link
                key={collection.id}
                href={destinationUrl}
                className="group relative h-80 sm:h-96 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end border border-gray-100"
              >
              {/* Background Image */}
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />

              {/* Gold Border Highlight on Hover */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C9A648]/80 transition-all duration-500 rounded-xl pointer-events-none" />

              {/* Content Card */}
              <div className="relative z-10 p-4 sm:p-6 text-white transform group-hover:-translate-y-1 transition-transform duration-300">
                <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#171717]/80 backdrop-blur-sm border border-[#C9A648]/40 text-[#D4AF37] text-[9px] sm:text-[10px] uppercase tracking-widest rounded mb-1.5 sm:mb-2">
                  {collection.itemCount}
                </span>

                <h3 className="text-base sm:text-xl font-serif tracking-wide text-white group-hover:text-[#F3E5AB] transition-colors line-clamp-1">
                  {collection.title}
                </h3>

                <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1 font-light line-clamp-1">
                  {collection.subtitle}
                </p>

                <div className="mt-3 sm:mt-4 flex items-center text-[10px] sm:text-xs text-[#D4AF37] font-medium tracking-widest uppercase group-hover:translate-x-1 transition-transform">
                  <span>Discover Now</span>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      </div>
    </section>
  );
}
