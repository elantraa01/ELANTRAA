"use client";

import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648]">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Privacy Policy</span>
            </nav>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <span className="text-xs tracking-[0.3em] text-[#C9A648] uppercase font-bold">DATA PROTECTION</span>
            <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 mt-1 tracking-tight">
              Privacy Policy
            </h1>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-600 font-light space-y-6 leading-relaxed">
            <p>
              ELANTRAA Privé values your privacy. This policy outlines how we collect, protect, and use your personal information across our website and digital services.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">1. Information Collection</h3>
            <p>
              We collect personal information such as your name, email address, contact phone number, shipping address, and sizing preferences when you register an account, place an order, or subscribe to our newsletter.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">2. 256-Bit SSL Data Security</h3>
            <p>
              Your payment information is processed through 256-bit SSL bank-level encrypted payment gateways (Razorpay). ELANTRAA never stores full credit card details on our servers.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">3. Cookies & Analytics</h3>
            <p>
              We use essential cookies to maintain your shopping bag items, manage authentication sessions, and offer a personalized shopping experience.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
