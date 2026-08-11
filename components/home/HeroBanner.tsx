"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export interface HeroData {
  tagline: string;
  title: string;
  highlight: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgImage: string;
  bgVideo?: string;
}

export default function HeroBanner() {
  const [hero, setHero] = useState<HeroData | null>(null);

  useEffect(() => {
    async function loadHero() {
      try {
        const res = await fetch("/api/hero");
        if (res.ok) {
          const data = await res.json();
          if (data.hero?.title && (data.hero?.bgImage || data.hero?.bgVideo)) {
            setHero({
              tagline: data.hero.tagline || "",
              title: data.hero.title,
              highlight: data.hero.highlight || "",
              description: data.hero.description || "",
              buttonText: data.hero.buttonText || "Shop",
              buttonLink: data.hero.buttonLink || "/shop",
              bgImage: data.hero.bgImage || "",
              bgVideo: data.hero.bgVideo,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load hero banner", err);
      }
    }
    loadHero();
  }, []);

  if (!hero) return null;

  const isVideoBg = Boolean(
    hero.bgVideo ||
      (hero.bgImage && (
        hero.bgImage.endsWith(".mp4") ||
        hero.bgImage.endsWith(".webm") ||
        hero.bgImage.endsWith(".mov") ||
        hero.bgImage.startsWith("data:video/")
      ))
  );

  return (
    <section className="relative w-full min-h-[80vh] sm:min-h-[88vh] flex items-center justify-center bg-[#171717] overflow-hidden border-b border-[#C9A648]/20">
      {/* Background Media Overlay (Video or Image) */}
      <div className="absolute inset-0 z-0">
        {isVideoBg ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={hero.bgImage}
            className="w-full h-full object-cover object-center opacity-85 transition-transform duration-1000 scale-100"
          >
            <source src={hero.bgVideo || hero.bgImage} />
          </video>
        ) : (
          <Image
            src={hero.bgImage}
            alt="ELANTRAA Autumn/Winter Collection"
            fill
            priority
            className="object-cover object-center opacity-85 transition-transform duration-1000 scale-100 hover:scale-105"
            sizes="100vw"
          />
        )}
        {/* Soft Luxury Gradient Overlay for readable gold text */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent sm:from-black/80 sm:via-black/55" />
      </div>

      {/* Hero Content Box */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left w-full">
        <div className="max-w-2xl text-white">
          {/* Tagline Badge */}
          <div className="max-w-full inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-[#D4AF37]/50 rounded-full mb-6 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] text-[#F3E5AB] uppercase font-medium truncate max-w-full">
              {hero.tagline}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-serif tracking-tight font-light leading-[1.1] mb-6 text-white">
            {hero.title} <br />
            <span className="italic font-normal bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent">
              {hero.highlight}
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-gray-200 font-light leading-relaxed mb-8 max-w-xl font-sans">
            {hero.description}
          </p>

          {/* Single CTA Button */}
          <div>
            <Link
              href={hero.buttonLink}
              className="inline-flex items-center justify-center px-9 py-4 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white font-medium text-xs sm:text-sm tracking-[0.2em] uppercase rounded shadow-xl hover:shadow-[#C9A648]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group"
            >
              <span>{hero.buttonText}</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
