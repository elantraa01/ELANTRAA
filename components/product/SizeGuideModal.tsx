/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChartImage?: string | null; // Inches chart
  sizeChartCm?: string | null;    // Centimeters chart
  productName?: string;
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  sizeChartImage,
  sizeChartCm,
  productName,
}: SizeGuideModalProps) {
  // Determine default unit: if Inches exists, default to "in", otherwise "cm"
  const hasInchesChart = Boolean(sizeChartImage && sizeChartImage.trim().length > 0);
  const hasCmChart = Boolean(sizeChartCm && sizeChartCm.trim().length > 0);

  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!hasInchesChart && hasCmChart) {
      setUnit("cm");
    } else {
      setUnit("in");
    }
    setIsZoomed(false);
  }, [hasInchesChart, hasCmChart, isOpen]);

  if (!isOpen) return null;

  const currentChartUrl = unit === "in" ? (sizeChartImage || sizeChartCm) : (sizeChartCm || sizeChartImage);
  const currentChartLabel = unit === "in" ? "Inches (\")" : "Centimeters (cm)";
  const isFallback = (unit === "in" && !hasInchesChart && hasCmChart) || (unit === "cm" && !hasCmChart && hasInchesChart);

  return (
    <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C9A648] animate-pulse" />
              <h3 className="text-sm sm:text-base font-serif tracking-widest uppercase text-gray-900 font-semibold">
                Size Chart & Fit Guide
              </h3>
            </div>
            <p className="text-[11px] text-[#C9A648] uppercase tracking-wider font-medium mt-0.5">
              {productName ? `${productName}` : "ELANTRAA"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-200/60 transition-colors"
            aria-label="Close size guide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Unit Selector Bar (Inches vs Centimeters) */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-sans font-medium">Measurement Unit:</span>
            <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setUnit("in");
                  setIsZoomed(false);
                }}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                  unit === "in"
                    ? "bg-[#171717] text-[#D4AF37] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>Inches (&quot;)</span>
                {hasInchesChart && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUnit("cm");
                  setIsZoomed(false);
                }}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                  unit === "cm"
                    ? "bg-[#171717] text-[#D4AF37] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>Centimeters (cm)</span>
                {hasCmChart && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648]" />}
              </button>
            </div>
          </div>

          {currentChartUrl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isZoomed ? "M20 12H4" : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"} />
                </svg>
                <span>{isZoomed ? "Reset View" : "Zoom Chart"}</span>
              </button>
              <a
                href={currentChartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-50 text-[#9b7a1d] hover:bg-amber-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Full Image</span>
                <span>↗</span>
              </a>
            </div>
          )}
        </div>

        {/* Scrollable Size Chart Image Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {currentChartUrl ? (
            <div className="space-y-3">
              {isFallback && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>
                    Showing available chart image for this product (standard conversions apply).
                  </span>
                </div>
              )}

              {/* Chart Image Display */}
              <div
                className={`relative rounded-2xl border border-gray-200/90 overflow-hidden bg-[#FAF8F5] transition-all duration-300 flex items-center justify-center ${
                  isZoomed ? "overflow-x-auto p-2" : "p-2 max-h-[62vh]"
                }`}
              >
                <img
                  src={currentChartUrl}
                  alt={productName ? `${productName} Size Chart (${currentChartLabel})` : `Size Chart (${currentChartLabel})`}
                  className={`object-contain rounded-xl transition-transform duration-200 shadow-sm ${
                    isZoomed
                      ? "min-w-[800px] sm:min-w-[950px] scale-100 cursor-zoom-out"
                      : "w-full h-auto max-h-[58vh] cursor-zoom-in hover:brightness-[1.02]"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>* Tap on image to zoom in/out</span>
                <span className="font-semibold text-gray-700 uppercase tracking-wider">
                  Active: {currentChartLabel} Chart
                </span>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-[#C9A648] flex items-center justify-center mx-auto text-xl">
                📐
              </div>
              <h4 className="text-base font-serif text-gray-900 font-semibold">
                Size Chart Coming Soon
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Detailed size chart image for this garment is being prepared. Please contact our stylists for sizing assistance.
              </p>
            </div>
          )}

          {/* Measuring Guide Tips */}
          <div className="p-4 bg-[#C9A648]/10 rounded-xl border border-[#C9A648]/25 text-xs text-gray-800 space-y-1.5">
            <p className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>📏</span> How to Measure:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-gray-700">
              <p>• <strong>Bust:</strong> Fullest part of chest with tape relaxed.</p>
              <p>• <strong>Waist:</strong> Natural waistline, tape comfortably loose.</p>
              <p>• <strong>Hips:</strong> Around fullest part with feet together.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-light hidden sm:inline">
            Custom size alterations available upon request via WhatsApp.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-[#171717] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-[#C9A648] hover:text-white transition-colors shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
