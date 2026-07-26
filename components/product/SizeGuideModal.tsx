"use client";

import { useState } from "react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"in" | "cm">("in");

  if (!isOpen) return null;

  const sizeChartInches = [
    { size: "XS", bust: '31-32"', waist: '24-25"', hips: '34-35"', length: '42"' },
    { size: "S", bust: '33-34"', waist: '26-27"', hips: '36-37"', length: '43"' },
    { size: "M", bust: '35-36"', waist: '28-29"', hips: '38-39"', length: '44"' },
    { size: "L", bust: '37-39"', waist: '30-32"', hips: '40-42"', length: '45"' },
    { size: "XL", bust: '40-42"', waist: '33-35"', hips: '43-45"', length: '46"' },
    { size: "XXL", bust: '43-45"', waist: '36-38"', hips: '46-48"', length: '47"' },
  ];

  const sizeChartCm = [
    { size: "XS", bust: "78-81 cm", waist: "61-63 cm", hips: "86-89 cm", length: "106 cm" },
    { size: "S", bust: "84-86 cm", waist: "66-68 cm", hips: "91-94 cm", length: "109 cm" },
    { size: "M", bust: "89-91 cm", waist: "71-74 cm", hips: "96-99 cm", length: "111 cm" },
    { size: "L", bust: "94-99 cm", waist: "76-81 cm", hips: "101-106 cm", length: "114 cm" },
    { size: "XL", bust: "101-106 cm", waist: "84-89 cm", hips: "109-114 cm", length: "117 cm" },
    { size: "XXL", bust: "109-114 cm", waist: "91-96 cm", hips: "117-122 cm", length: "119 cm" },
  ];

  const activeChart = unit === "in" ? sizeChartInches : sizeChartCm;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-base font-serif tracking-widest uppercase text-gray-900 font-semibold">
              Fit & Size Guide
            </h3>
            <p className="text-[11px] text-[#C9A648] uppercase tracking-wider font-medium">
              ELANTRAA Couture Standard Sizing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-200/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-sans">
            Select Unit:
          </span>
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              onClick={() => setUnit("in")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                unit === "in" ? "bg-[#171717] text-[#D4AF37] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Inches (&quot;)
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                unit === "cm" ? "bg-[#171717] text-[#D4AF37] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-800 font-serif uppercase tracking-wider">
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Bust</th>
                <th className="py-2.5 px-3">Waist</th>
                <th className="py-2.5 px-3">Hips</th>
                <th className="py-2.5 px-3">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {activeChart.map((row) => (
                <tr key={row.size} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[#C9A648]">{row.size}</td>
                  <td className="py-2.5 px-3">{row.bust}</td>
                  <td className="py-2.5 px-3">{row.waist}</td>
                  <td className="py-2.5 px-3">{row.hips}</td>
                  <td className="py-2.5 px-3">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Measuring Tips */}
          <div className="mt-5 p-3.5 bg-[#C9A648]/10 rounded-lg border border-[#C9A648]/20 text-[11px] text-gray-700 space-y-1">
            <p className="font-semibold text-gray-900 uppercase tracking-wider">How to Measure:</p>
            <p>• <strong>Bust:</strong> Measure around the fullest part of your chest with tape relaxed.</p>
            <p>• <strong>Waist:</strong> Measure around your natural waistline, keeping tape comfortably loose.</p>
            <p>• <strong>Hips:</strong> Stand with feet together and measure around the fullest part of your hips.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#171717] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#C9A648] hover:text-white transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
