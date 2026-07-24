"use client";

import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648]">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Shipping & Delivery</span>
            </nav>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <span className="text-xs tracking-[0.3em] text-[#C9A648] uppercase font-bold">CLIENT SERVICES</span>
            <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 mt-1 tracking-tight">
              Worldwide Express Shipping Policy
            </h1>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-gray-600 font-light space-y-6 leading-relaxed">
            <p>
              At ELANTRAA, each creation represents hours of master craftsmanship. We partner exclusively with international courier services (DHL Express, FedEx Privé) to ensure your haute couture items arrive in pristine condition.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">1. Delivery Timelines</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Domestic Orders (India):</strong> 2 to 4 business days with complimentary express shipping on orders above ₹5,000.</li>
              <li><strong>International Orders:</strong> 4 to 7 business days via DHL Express Air.</li>
              <li><strong>Bespoke & Made-To-Order:</strong> 10 to 14 business days due to custom tailoring and embroidery work.</li>
            </ul>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">2. Order Tracking & Signature</h3>
            <p>
              Every shipment is fully insured against theft and accidental damage. Upon dispatch, you will receive an SMS and email notification with your live tracking number. A recipient signature is required upon delivery.
            </p>

            <h3 className="text-lg font-serif text-gray-900 font-semibold mt-6">3. Duties & Customs</h3>
            <p>
              For international shipments outside India, customs duties and import taxes may be assessed by your local government customs agency. ELANTRAA covers all handling fees upfront.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
