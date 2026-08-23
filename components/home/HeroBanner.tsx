"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  bgImages?: string[];
  bgVideo?: string;
}

export default function HeroBanner() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    async function loadHero() {
      try {
        const res = await fetch("/api/hero");
        if (res.ok) {
          const data = await res.json();
          const rawHero = data.hero;
          if (rawHero?.title && (rawHero?.bgImage || (rawHero?.bgImages && rawHero.bgImages.length > 0) || rawHero?.bgVideo)) {
            const rawList: string[] = Array.isArray(rawHero.bgImages) && rawHero.bgImages.length > 0
              ? rawHero.bgImages
              : rawHero.bgImage ? [rawHero.bgImage] : [];

            const sanitizedImages = rawList.map((img: string) => img.trim()).filter(Boolean);

            setHero({
              tagline: rawHero.tagline || "",
              title: rawHero.title,
              highlight: rawHero.highlight || "",
              description: rawHero.description || "",
              buttonText: rawHero.buttonText || "Shop",
              buttonLink: rawHero.buttonLink || "/shop",
              bgImage: sanitizedImages[0] || rawHero.bgImage || "",
              bgImages: sanitizedImages.length > 0 ? sanitizedImages : (rawHero.bgImage ? [rawHero.bgImage] : []),
              bgVideo: rawHero.bgVideo || undefined,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load hero banner", err);
      }
    }
    loadHero();
  }, []);

  const slideImages = hero?.bgImages && hero.bgImages.length > 0 ? hero.bgImages : (hero?.bgImage ? [hero.bgImage] : []);
  const totalSlides = slideImages.length;

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay slideshow timer
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, nextSlide]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="relative w-full min-h-[80vh] sm:min-h-[88vh] flex items-center justify-center bg-[#171717] overflow-hidden border-b border-[#C9A648]/20 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Media Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
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
          slideImages.map((imgUrl, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={`${imgUrl}-${index}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-90 z-10 scale-100 pointer-events-auto" : "opacity-0 z-0 scale-105 pointer-events-none"
                }`}
                style={{
                  transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 6s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                <Image
                  src={imgUrl}
                  alt={`${hero.title} Banner Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            );
          })
        )}

        {/* Luxury Gold & Dark Gradient Overlays */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/85 via-black/55 to-black/25 sm:from-black/85 sm:via-black/50 sm:to-transparent" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Hero Content Box */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left w-full">
        <div className="max-w-2xl text-white">
          {/* Tagline Badge */}
          <div className="max-w-full inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-[#D4AF37]/50 rounded-full mb-6 overflow-hidden shadow-lg shadow-black/40">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] text-[#F3E5AB] uppercase font-medium truncate max-w-full">
              {hero.tagline}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-serif tracking-tight font-light leading-[1.1] mb-6 text-white drop-shadow-md">
            {hero.title} <br />
            <span className="italic font-normal bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent">
              {hero.highlight}
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-gray-200 font-light leading-relaxed mb-8 max-w-xl font-sans drop-shadow">
            {hero.description}
          </p>

          {/* CTA & Slide Navigation Row */}
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href={hero.buttonLink}
              className="inline-flex items-center justify-center px-9 py-4 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white font-medium text-xs sm:text-sm tracking-[0.2em] uppercase rounded shadow-xl hover:shadow-[#C9A648]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group"
            >
              <span>{hero.buttonText}</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            {/* Quick Slide Index (e.g. 01 / 03) */}
            {totalSlides > 1 && !isVideoBg && (
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 text-xs font-mono text-[#F3E5AB]">
                <span className="font-semibold text-white">0{currentSlide + 1}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-400">0{totalSlides}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Chevrons (Previous / Next) */}
      {totalSlides > 1 && !isVideoBg && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/35 hover:bg-[#C9A648] text-white/80 hover:text-black border border-white/20 hover:border-[#C9A648] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/35 hover:bg-[#C9A648] text-white/80 hover:text-black border border-white/20 hover:border-[#C9A648] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Bottom Slide Indicators / Dots & Progress Lines */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
            {slideImages.map((_, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={`indicator-${index}`}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className="group py-1 focus:outline-none"
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isActive
                        ? "w-8 bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] shadow-sm shadow-[#D4AF37]/50"
                        : "w-2 bg-white/40 group-hover:bg-white/70 group-hover:w-4"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
