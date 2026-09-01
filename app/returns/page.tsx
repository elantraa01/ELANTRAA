"use client";

import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function ReturnsPolicyPage() {
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
              <span className="text-gray-900 font-medium">Return & Exchange Policy</span>
            </nav>
          </div>
        </div>

        {/* Header Banner */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="border-b border-gray-200 pb-8 mb-10 text-center sm:text-left">
            <span className="text-xs tracking-[0.3em] text-[#C9A648] uppercase font-bold">CLIENT SERVICES</span>
            <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 mt-2 tracking-tight">
              Return & Exchange Policy
            </h1>
            <p className="mt-3 text-sm text-gray-600 font-light leading-relaxed">
              At Elantraa, we want you to be happy with your purchase. Every product is carefully checked before dispatch. Please read our return and exchange policy before placing your order.
            </p>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-[#FAF8F5] border-l-4 border-[#C9A648] p-5 rounded-r-lg mb-10">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#C9A648] shrink-0 mt-0.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
                <strong>48-Hour Notice Window:</strong> All return and exchange requests must be raised within <strong>48 hours</strong> of delivery with proper proof (photos / unboxing video).
              </p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-10 text-gray-700 leading-relaxed font-light text-sm sm:text-base">
            
            {/* Section 1: Returns */}
            <section className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#C9A648] text-white flex items-center justify-center font-serif text-sm font-semibold">
                  1
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-medium">
                  Returns
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 font-light">
                We currently accept returns only in the following cases:
              </p>
              <ul className="space-y-2.5 pl-4 border-l-2 border-[#C9A648]/30 ml-4 text-xs sm:text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#C9A648] shrink-0 mt-0.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>The product received is damaged or defective.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#C9A648] shrink-0 mt-0.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>You have received the wrong product, size, or item due to an error on our part.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#C9A648] shrink-0 mt-0.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>If the product is returnable as explicitly mentioned in its product description.</span>
                </li>
              </ul>

              <div className="bg-gray-50 border border-gray-200/70 rounded-lg p-5">
                <h3 className="font-serif text-sm font-semibold text-gray-900 mb-2">How to Request a Return:</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 font-light">
                  Return requests must be raised within <strong>48 hours of delivery</strong>. Please contact us via our website contact details and provide:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 font-light">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648]" />
                    <span>Your order number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648]" />
                    <span>Clear photographs / videos of the product</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648]" />
                    <span>A clear unboxing video</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648]" />
                    <span>Detailed description of the issue</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3 italic">
                  * Our team will review the request and confirm whether the product is eligible for return.
                </p>
              </div>
            </section>

            {/* Section 2: Exchanges */}
            <section className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#C9A648] text-white flex items-center justify-center font-serif text-sm font-semibold">
                  2
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-medium">
                  Exchanges
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 font-light">
                We offer exchanges for size-related issues, subject to product availability:
              </p>
              <ul className="space-y-2.5 pl-4 border-l-2 border-[#C9A648]/30 ml-4 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Timeframe:</strong> Exchange requests must be raised within <strong>48 hours of delivery</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Condition:</strong> The product must be unused, unworn, unwashed, and unaltered, with all original tags, labels, and packaging intact.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Disqualification:</strong> Products that have been damaged, stained, washed, altered, or worn may not be eligible for exchange.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Stock Availability:</strong> Exchanges are subject to availability of the requested size. If unavailable, we may offer an alternative solution depending on circumstances.</span>
                </li>
              </ul>
            </section>

            {/* Section 3: Non-Returnable Items */}
            <section className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-700 text-white flex items-center justify-center font-serif text-sm font-semibold">
                  3
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-medium">
                  Non-Returnable & Non-Exchangeable Products
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 font-light">
                The following products are strictly <strong>not eligible</strong> for return or exchange:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Customized or personalized products",
                  "Made-to-measure garments",
                  "Products altered at the customer's request",
                  "Products that have been worn, washed, ironed or altered",
                  "Products without original tags or packaging",
                  "Products damaged after delivery due to improper use or care",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-rose-50/50 border border-rose-100 rounded-lg text-xs sm:text-sm text-gray-700">
                    <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Refunds */}
            <section className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#C9A648] text-white flex items-center justify-center font-serif text-sm font-semibold">
                  4
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-medium">
                  Refunds
                </h2>
              </div>
              <ul className="space-y-3 pl-4 border-l-2 border-[#C9A648]/30 ml-4 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span>If a return is approved, the refund will be processed after the returned product has been received and inspected by Elantraa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span>Refunds will be issued to the original payment method, wherever applicable.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span>Shipping charges, if any, may be non-refundable unless the return is due to an error or defect on our part.</span>
                </li>
              </ul>
            </section>

            {/* Section 5: Return Shipping */}
            <section className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#C9A648] text-white flex items-center justify-center font-serif text-sm font-semibold">
                  5
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-gray-900 font-medium">
                  Return Shipping
                </h2>
              </div>
              <ul className="space-y-3 pl-4 border-l-2 border-[#C9A648]/30 ml-4 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Defective / Wrong Product:</strong> If the return or exchange is due to a wrong, damaged or defective product received, Elantraa will assist with the return shipping.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A648] font-bold mt-0.5">•</span>
                  <span><strong>Customer-Requested Exchanges:</strong> For size exchanges or other eligible customer-requested exchanges, return / re-shipping charges may apply.</span>
                </li>
              </ul>
            </section>

            {/* Important Note Box */}
            <div className="bg-[#FAF8F5] border border-[#C9A648]/30 rounded-xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C9A648]/10 text-[#C9A648] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg text-gray-900 font-semibold mb-2">
                    Important Sizing Note
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 font-light leading-relaxed mb-4">
                    Please check the size chart and product measurements carefully before placing your order. Since our garments may have different fits and styles, selecting the correct size is the customer&apos;s responsibility. You can also take suggestions from us for size guidance before ordering by messaging us on our official Instagram page.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                      Instagram Sizing Help
                    </a>
                    <a
                      href="https://wa.me/919015342951"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                      </svg>
                      WhatsApp Concierge
                    </a>
                    <a
                      href="mailto:elantraa.01@gmail.com"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-[#C9A648] transition-colors"
                    >
                      <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      Email Us
                    </a>
                  </div>
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

