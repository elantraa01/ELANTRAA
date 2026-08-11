"use client";

import { useState, useEffect } from "react";
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

  const initialImg = images[selectedImageIndex] || images[0] || "";
  const [currentImage, setCurrentImage] = useState(initialImg);

  useEffect(() => {
    setCurrentImage(images[selectedImageIndex] || images[0] || "");
  }, [images, selectedImageIndex]);

  const activeImage = currentImage;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 w-full">
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-2.5 sm:gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar shrink-0 pb-1 lg:pb-0 w-full lg:w-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative w-14 h-18 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                selectedImageIndex === idx
                  ? "border-[#C9A648] shadow-md ring-2 ring-[#C9A648]/30"
                  : "border-gray-200 opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${productName} view ${idx + 1}`} fill className="object-cover" />
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

        {/* Zoom Hint / Lightbox Trigger */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-[#C9A648] hover:bg-white transition-all shadow-md"
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-3 bg-black/60 hover:bg-[#C9A648] text-white rounded-full transition-all shadow-2xl border border-white/20 active:scale-95"
            aria-label="Close Lightbox"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Expanded Image Box */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center p-2 pointer-events-none"
          >
            {activeImage && (
              <Image
                src={activeImage}
                alt={productName}
                fill
                className="object-contain pointer-events-auto"
                sizes="100vw"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
