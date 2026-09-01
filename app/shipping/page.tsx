"use client";

import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Breadcrumb */}
        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Shipping Policy</span>
            </nav>
          </div>
        </div>

        {/* Header Banner */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="border-b border-gray-200 pb-8 mb-10 text-center sm:text-left">
            <span className="text-xs tracking-[0.3em] text-[#C9A648] uppercase font-bold">CLIENT SERVICES</span>
            <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 mt-2 tracking-tight">
              Shipping & Delivery Policy
            </h1>
            <p className="mt-3 text-sm text-gray-500 font-light leading-relaxed">
              At Elantraa, we carefully pack and dispatch every order to ensure your products reach you safely and on time.
            </p>
          </div>

          {/* Policy Highlights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-[#FAF8F5] border border-gray-200/80 rounded-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#C9A648]/10 text-[#C9A648] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="font-serif text-base font-semibold text-gray-900 mb-1">Processing Time</h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Dispatched within 5–10 business days after order confirmation.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] border border-gray-200/80 rounded-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#C9A648]/10 text-[#C9A648] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 className="font-serif text-base font-semibold text-gray-900 mb-1">Worldwide Shipping</h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                We deliver globally with trusted courier partners.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] border border-gray-200/80 rounded-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#C9A648]/10 text-[#C9A648] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3 className="font-serif text-base font-semibold text-gray-900 mb-1">Live Tracking</h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Receive tracking details via contact info as soon as parcel ships.
              </p>
            </div>
          </div>

          {/* Detailed Policy Content */}
          <div className="space-y-10 text-gray-700 leading-relaxed font-light text-sm sm:text-base">
            
            {/* Section 1 */}
            <section className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#C9A648] text-white flex items-center justify-center font-serif text-sm font-semibold">
                  1
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-medium">
                  Order Processing
                </h2>
              </div>
              <ul className="space-y-3 pl-4 border-l-2 border-[#C9A648]/30 ml-4 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Standard Orders:</strong> Orders are generally processed and dispatched within <strong>5–10 business days</strong> after the order is confirmed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Customized / Made-To-Order:</strong> Orders containing customized or made-to-order products may require additional processing time. The estimated dispatch time will be communicated to you at the time of purchase.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Weekends & Holidays:</strong> Orders placed on Sundays or public holidays will be processed on the next working day.</span>
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#C9A648] text-white flex items-center justify-center font-serif text-sm font-semibold">
                  2
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-medium">
                  Shipping & Delivery
                </h2>
              </div>
              <ul className="space-y-3 pl-4 border-l-2 border-[#C9A648]/30 ml-4 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Worldwide Coverage:</strong> We currently ship across worldwide.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Tracking Details:</strong> Once your order is dispatched, you will receive a shipping confirmation with tracking details via your registered contact information.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Delivery Duration:</strong> Delivery usually takes approximately <strong>5–10 business days</strong> after dispatch depending on the destination.</span>
                </li>
              </ul>
            </section>

            {/* Contact / Assistance Box */}
            <div className="bg-[#FAF8F5] border border-[#C9A648]/20 rounded-xl p-6 sm:p-8 mt-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-serif text-lg text-gray-900 font-semibold mb-1">Need Help with Shipping?</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-light">
                    Have questions about your delivery timeline or international shipment? Contact our client concierge.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href="mailto:elantraa.01@gmail.com"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#C9A648] transition-colors"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Email Us
                  </a>
                  <a
                    href="https://wa.me/919015342951"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

