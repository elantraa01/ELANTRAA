/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChartImage?: string | null; // Inches chart
  sizeChartCm?: string | null;    // Fallback chart if any
  productName?: string;
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  sizeChartImage,
  sizeChartCm,
  productName,
}: SizeGuideModalProps) {
  const chartImage = sizeChartImage || sizeChartCm || "";
  const [activeTab, setActiveTab] = useState<"inches" | "howToMeasure">("inches");
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDiagramZoomed, setIsDiagramZoomed] = useState(false);

  useEffect(() => {
    setActiveTab("inches");
    setIsZoomed(false);
    setIsDiagramZoomed(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const waLink = `https://wa.me/919015342951?text=${encodeURIComponent(
    `Hi ELANTRAA team, I would like to inquire about custom measurements for "${productName || "an outfit"}".`
  )}`;

  const howToMeasureDiagram = "/images/size-guide/papa-dont-preach-by-shubhika-1742202349892.jpeg";

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
              {productName ? `${productName}` : "ELANTRAA COUTURE"}
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

        {/* Tab Navigation: INCHES (") vs HOW TO MEASURE */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-sans font-medium">View:</span>
            <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("inches");
                  setIsZoomed(false);
                  setIsDiagramZoomed(false);
                }}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "inches"
                    ? "bg-[#171717] text-[#D4AF37] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>Inches (&quot;)</span>
                {activeTab === "inches" && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("howToMeasure");
                  setIsZoomed(false);
                  setIsDiagramZoomed(false);
                }}
                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "howToMeasure"
                    ? "bg-[#171717] text-[#D4AF37] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>How to Measure</span>
                {activeTab === "howToMeasure" && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648]" />}
              </button>
            </div>
          </div>

          {activeTab === "inches" && chartImage && (
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
                href={chartImage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-50 text-[#9b7a1d] hover:bg-amber-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Full Image</span>
                <span>↗</span>
              </a>
            </div>
          )}

          {activeTab === "howToMeasure" && (
            <div className="flex items-center gap-2">
              <a
                href={howToMeasureDiagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-50 text-[#9b7a1d] hover:bg-amber-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Full Diagram</span>
                <span>↗</span>
              </a>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Ask a Stylist</span>
                <span>💬</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === "inches" ? (
            /* Tab 1: Size Chart (Inches Only) */
            chartImage ? (
              <div className="space-y-3">
                {/* Chart Image Display */}
                <div
                  className={`relative rounded-2xl border border-gray-200/90 overflow-hidden bg-[#FAF8F5] transition-all duration-300 flex items-center justify-center ${
                    isZoomed ? "overflow-x-auto p-2" : "p-2 max-h-[62vh]"
                  }`}
                >
                  <img
                    src={chartImage}
                    alt={productName ? `${productName} Size Chart (Inches)` : "Size Chart (Inches)"}
                    className={`object-contain rounded-xl transition-transform duration-200 shadow-sm ${
                      isZoomed
                        ? "min-w-[800px] sm:min-w-[950px] scale-100 cursor-zoom-out"
                        : "w-full h-auto max-h-[58vh] cursor-zoom-in hover:brightness-[1.02]"
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>* All measurements are in inches (&quot;). Tap on image to zoom.</span>
                  <span className="font-semibold text-gray-700 uppercase tracking-wider">
                    Inches (&quot;) Chart
                  </span>
                </div>

                {/* Quick measuring note */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                  <span>Need help taking your measurements?</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("howToMeasure")}
                    className="text-[#C9A648] font-semibold underline hover:text-gray-900 text-xs"
                  >
                    View Measurement Guide →
                  </button>
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
                  Detailed size chart in inches for this garment is being prepared. Please click on &quot;How to Measure&quot; or contact our stylists for personalized sizing.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("howToMeasure")}
                  className="mt-2 px-4 py-2 bg-[#171717] text-[#D4AF37] text-xs font-semibold rounded-lg"
                >
                  View How to Measure
                </button>
              </div>
            )
          ) : (
            /* Tab 2: How to Measure Section with Diagram & Guidelines */
            <div className="space-y-5 animate-in fade-in duration-200 font-sans">
              {/* Custom Measurement Header Banner */}
              <div className="p-4 bg-gradient-to-r from-[#FAF8F5] via-white to-[#FAF8F5] rounded-xl border border-[#C9A648]/40 shadow-2xs">
                <p className="text-xs sm:text-[13px] text-gray-800 leading-relaxed">
                  For Custom measurement, you can connect us at{" "}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C9A648] hover:text-[#9b7a1d] font-semibold underline transition-colors"
                  >
                    WhatsApp (+91 9015342951)
                  </a>{" "}
                  - Or{" "}
                  <a
                    href="mailto:elantraa.01@gmail.com"
                    className="text-[#C9A648] hover:text-[#9b7a1d] font-semibold underline transition-colors"
                  >
                    elantraa.01@gmail.com
                  </a>
                </p>
              </div>

              {/* Measurement Points Diagram Illustration */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-gray-200/90 p-3 sm:p-4 text-center space-y-2">
                <div
                  className={`relative overflow-hidden rounded-xl bg-white border border-gray-200 flex items-center justify-center transition-all ${
                    isDiagramZoomed ? "overflow-x-auto p-2" : "p-2 max-h-[65vh]"
                  }`}
                >
                  <img
                    src={howToMeasureDiagram}
                    alt="Body Measurement Diagram Guide - Front and Back View"
                    className={`object-contain rounded-lg transition-transform duration-200 ${
                      isDiagramZoomed
                        ? "min-w-[750px] scale-100 cursor-zoom-out"
                        : "w-full h-auto max-h-[60vh] cursor-zoom-in hover:brightness-[1.02]"
                    }`}
                    onClick={() => setIsDiagramZoomed(!isDiagramZoomed)}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                  <span>* Tap diagram to zoom in/out</span>
                  <span className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                    Front & Back Measurement Guide
                  </span>
                </div>
              </div>

              {/* 9 Numbered Measurement Points */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs sm:text-sm font-serif uppercase tracking-widest text-gray-900 font-semibold mb-3 flex items-center gap-2">
                  <span className="text-[#C9A648]">✦</span> Step-by-Step Measurement Details
                </h4>

                {/* 1. Chest */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Chest:</strong> Place the tape close under the armhole and measure from side seam to side seam.
                  </div>
                </div>

                {/* 2. Waist */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Waist:</strong> This is the narrowest part of the waist. Place the tape from side to side directly at the waistline.
                  </div>
                </div>

                {/* 3. Hip */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Hip:</strong> Place the tape approximately 7–9 inches below the natural waistline and measure from side to side at the hip line.
                  </div>
                </div>

                {/* 4. Flare */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Flare:</strong> This is the length of the flare of your dress. Flare is the bottom wide length of your dress.
                  </div>
                </div>

                {/* 5. Strap to Hem */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    5
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Strap to Hem:</strong> This is the length from the top of the strap down to the hem.
                  </div>
                </div>

                {/* 6. Waist to Hem */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    6
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Waist to Hem:</strong> This is the length from the top of the waistband to the bottom of the hemline.
                  </div>
                </div>

                {/* 7. Measure your chest */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    7
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Measure your chest:</strong> Stand up straight with your arms hang down in a relaxed, natural pose. Measure around the fullest part of your chest. Tight up under the armpits and over the shoulder blades.
                  </div>
                </div>

                {/* 8. Measure your waist */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    8
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Measure your waist:</strong> Stand up straight in a relaxed, normal position. Run the tape around the narrowest part of your natural waist. This is usually where the belly button is.
                  </div>
                </div>

                {/* 9. Measure your hips */}
                <div className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:border-[#C9A648]/50 transition-colors flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#171717] text-[#D4AF37] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    9
                  </span>
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Measure your hips:</strong> Stand with your feet together. Measure around the fullest part of your hips and rear. This is typically midway between your crotch and your belly button.
                  </div>
                </div>
              </div>

              {/* Note text */}
              <p className="text-[11px] text-gray-500 italic text-center pt-2">
                Please refer to the above diagram &amp; guidelines for the correct measurements.
              </p>

              {/* Inquire Button */}
              <div className="pt-1">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white transition-all text-xs font-semibold uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <span>Connect for Custom Measurements on WhatsApp</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-light hidden sm:inline">
            All sizes in inches (&quot;). Custom tailoring assistance available via WhatsApp.
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
