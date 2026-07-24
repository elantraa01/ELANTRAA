"use client";

import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648]">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Terms & Conditions</span>
            </nav>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <span className="text-xs tracking-[0.3em] text-[#C9A648] uppercase font-bold">LEGAL AGREEMENT</span>
            <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 mt-1 tracking-tight">
              Terms & Conditions
            </h1>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-600 font-light space-y-6 leading-relaxed">
            <p>
              Welcome to ELANTRAA. By accessing or purchasing from our platform, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">1. Product Authenticity & Pricing</h3>
            <p>
              All products listed on ELANTRAA are 100% authentic haute couture garments. Prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to correct pricing errors.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">2. Intellectual Property</h3>
            <p>
              All designs, photographs, graphics, text, and logos displayed on ELANTRAA are protected by international copyright laws. Reproduction without written consent is strictly prohibited.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
