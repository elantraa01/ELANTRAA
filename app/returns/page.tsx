"use client";

import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648]">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Bespoke Policy</span>
            </nav>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <span className="text-xs tracking-[0.3em] text-[#C9A648] uppercase font-bold">ATELIER GUARANTEE</span>
            <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 mt-1 tracking-tight">
              Bespoke Couture & Order Policy
            </h1>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-600 font-light space-y-6 leading-relaxed">
            <p>
              Each ELANTRAA creation is crafted individually to order using hand-embroidered luxury silks and artisanal techniques. Due to the bespoke nature of haute couture, all orders are final.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">1. Quality Assurance & Inspection</h3>
            <p>
              Prior to dispatch, every piece undergoes rigorous multi-stage quality inspections to guarantee flawless embroidery, stitching, and finishing.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">2. Client Concierge Assistance</h3>
            <p>
              Should you require any assistance or custom sizing fitting guidance before placing your order, please contact our concierge team at <strong className="text-[#C9A648]">elantraa.01@gmail.com</strong> or via WhatsApp at <strong className="text-[#C9A648]">+91 9015342951</strong>.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
