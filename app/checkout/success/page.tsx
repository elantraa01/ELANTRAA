"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") || `ELN-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
      {/* Success Checkmark Ornament */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full border-2 border-emerald-200 mb-6 shadow-sm">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <span className="block text-xs font-serif tracking-[0.3em] uppercase text-[#C9A648] font-bold">
        THANK YOU FOR YOUR ORDER
      </span>

      <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 mt-2 tracking-tight">
        Order Confirmed!
      </h1>

      <p className="text-sm text-gray-600 font-light mt-3 max-w-md mx-auto">
        We have received your order. A confirmation email with receipt and tracking details has been sent.
      </p>

      {/* Order Details Card */}
      <div className="bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm mt-10 text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-2">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              ORDER REFERENCE
            </p>
            <p className="text-lg font-serif font-bold text-gray-900">{orderId}</p>
          </div>

          <div className="sm:text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              ESTIMATED DELIVERY
            </p>
            <p className="text-sm font-semibold text-emerald-700">
              2 - 4 Business Days (Express)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-600 font-light">
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-gray-900 mb-1">
              Delivery Details
            </h4>
            <p>Express Worldwide Courier</p>
            <p>Tracking number will be sent via SMS & Email</p>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wider text-gray-900 mb-1">
              Customer Concierge
            </h4>
            <p>Questions about your order?</p>
            <p className="text-[#C9A648] font-medium">elantraa.01@gmail.com | +91 9015342951</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/shop"
          className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white text-xs font-medium uppercase tracking-[0.2em] rounded shadow hover:opacity-95 transition-opacity"
        >
          Continue Shopping
        </Link>

        <Link
          href="/"
          className="px-8 py-3.5 bg-white text-gray-800 border border-gray-300 text-xs font-medium uppercase tracking-[0.2em] rounded hover:border-[#C9A648] transition-colors"
        >
          Return To Home
        </Link>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />
        <Suspense fallback={<div className="p-20 text-center text-gray-400">Loading Order Confirmation...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
