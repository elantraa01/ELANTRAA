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
              <span className="text-gray-900 font-medium">Returns & Exchanges</span>
            </nav>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <span className="text-xs tracking-[0.3em] text-[#C9A648] uppercase font-bold">CLIENT GUARANTEE</span>
            <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 mt-1 tracking-tight">
              Complimentary 15-Day Returns & Exchanges
            </h1>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-600 font-light space-y-6 leading-relaxed">
            <p>
              We want you to be completely delighted with your ELANTRAA couture piece. If the size or fit is not perfect, we offer a complimentary 15-day return and exchange window.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">1. Return Eligibility</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Items must be unworn, unwashed, and unaltered with original ELANTRAA tags and security ribbon intact.</li>
              <li>Returns must be initiated within 15 calendar days of receiving your package.</li>
              <li>Custom bespoke garments tailored to non-standard measurements are final sale.</li>
            </ul>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">2. Complimentary Courier Pickup</h3>
            <p>
              Our client concierge will arrange a doorstep pickup at your preferred address. Simply contact us at <strong className="text-[#C9A648]">concierge@elantraa.com</strong> or via WhatsApp.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">3. Refund Processing</h3>
            <p>
              Once returned items are inspected by our quality assurance team, refunds are issued back to your original payment method (Razorpay online or bank transfer for COD) within 3-5 business days.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
