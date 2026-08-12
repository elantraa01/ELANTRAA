"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeImages = useMemo(() => (Array.isArray(images) && images.length > 0 ? images : []), [images]);
  const initialImg = safeImages[selectedImageIndex] || safeImages[0] || "";
  const [currentImage, setCurrentImage] = useState(initialImg);

  useEffect(() => {
    setCurrentImage(safeImages[selectedImageIndex] || safeImages[0] || "");
  }, [safeImages, selectedImageIndex]);

  const activeImage = currentImage;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (safeImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : safeImages.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (safeImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev < safeImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 w-full">
      {/* Thumbnail Strip */}
      {safeImages.length > 1 && (
        <div className="flex lg:flex-col gap-2.5 sm:gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar shrink-0 pb-1 lg:pb-0 w-full lg:w-auto items-center">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                selectedImageIndex === idx
                  ? "border-[#C9A648] shadow-md ring-2 ring-[#C9A648]/40 scale-105"
                  : "border-gray-200 opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image src={img} alt={`${productName} view ${idx + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Display with Hover / Touch Zoom */}
      <div className="relative flex-1 aspect-[3/4] bg-[#FAF8F5] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm group border border-gray-100">
        <div
          className="relative w-full h-full cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setLightboxOpen(true)}
        >
          {activeImage ? (
            <Image
              src={activeImage}
              alt={productName}
              fill
              priority
              onError={() => setCurrentImage("")}
              className={`object-cover object-center transition-transform duration-300 ease-out ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              style={{
                transformOrigin: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : "center center",
              }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs uppercase tracking-widest text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Image Counter Badge (Visible when multiple images exist) */}
        {safeImages.length > 1 && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-[#171717]/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-mono font-medium rounded-full shadow-md z-10 pointer-events-none">
            {selectedImageIndex + 1} / {safeImages.length}
          </span>
        )}

        {/* Previous & Next Navigation Buttons */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-800 hover:bg-white hover:text-[#C9A648] transition-all shadow-md z-20 active:scale-95"
              aria-label="Previous Image"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-800 hover:bg-white hover:text-[#C9A648] transition-all shadow-md z-20 active:scale-95"
              aria-label="Next Image"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Zoom Hint / Lightbox Trigger */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-[#C9A648] hover:bg-white transition-all shadow-md z-20"
          aria-label="Expand Gallery Lightbox"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between z-50 p-2">
            <span className="text-white text-xs font-mono font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
              {selectedImageIndex + 1} / {safeImages.length}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              className="p-2.5 bg-white/10 hover:bg-[#C9A648] text-white rounded-full transition-all shadow-2xl border border-white/20 active:scale-95"
              aria-label="Close Lightbox"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Expanded Image Box */}
          <div className="relative max-w-4xl max-h-[75vh] w-full h-full flex items-center justify-center p-2">
            {activeImage && (
              <Image
                src={activeImage}
                alt={productName}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#C9A648] text-white transition-all shadow-xl z-50 border border-white/20"
                  aria-label="Previous Lightbox Image"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#C9A648] text-white transition-all shadow-xl z-50 border border-white/20"
                  aria-label="Next Lightbox Image"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails inside Lightbox */}
          {safeImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2 z-50 max-w-md" onClick={(e) => e.stopPropagation()}>
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-12 h-16 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx ? "border-[#C9A648] scale-105" : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="50px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
