"use client";

import Link from "next/link";

export default function ProductsComingSoon() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919015342951";

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] text-center border-t border-b border-gray-200">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 tracking-tight mb-4">
          Products Coming Soon
        </h2>
        <p className="text-sm text-gray-600 mb-8 font-light">
          For custom orders and inquiries, reach out directly to our concierge.
        </p>
        <Link
          href={`https://wa.me/${whatsappNumber}?text=Hello%20ELANTRAA,%20I%20would%20like%20to%20inquire%20about%20your%20upcoming%20products.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#25D366] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-md hover:bg-[#20bd5a] transition-colors"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
          </svg>
          <span>WhatsApp: +{whatsappNumber}</span>
        </Link>
      </div>
    </section>
  );
}
