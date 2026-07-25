"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-gray-300 pt-16 pb-12 border-t border-[#C9A648]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                <Image
                  src="/images/logo/logo.png"
                  alt="ELANTRAA Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-serif tracking-[0.25em] text-white group-hover:text-[#D4AF37] transition-colors">
                ELANTRAA
              </span>
            </Link>

            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm font-sans">
              ELANTRAA is an international haute couture fashion house dedicated to artisanal luxury, hand-embroidered silks, and modern bespoke tailoring.
            </p>

            <div className="pt-2 flex items-center space-x-4 text-[#D4AF37]">
              {["Instagram", "Pinterest", "Facebook", "Twitter"].map((social) => (
                <a
                  key={social}
                  href={`https://${social.toLowerCase()}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-widest hover:text-white transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-serif uppercase tracking-[0.2em] text-[#F3E5AB] mb-4">
              COLLECTIONS
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-light">
              <li>
                <Link href="/category/women" className="hover:text-[#D4AF37] transition-colors">
                  Women&apos;s Couture
                </Link>
              </li>
              <li>
                <Link href="/category/men" className="hover:text-[#D4AF37] transition-colors">
                  Tailored Menswear
                </Link>
              </li>
              <li>
                <Link href="/category/accessories" className="hover:text-[#D4AF37] transition-colors">
                  Luxury Accessories
                </Link>
              </li>
              <li>
                <Link href="/category/new-arrivals" className="hover:text-[#D4AF37] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/category/sale" className="hover:text-[#D4AF37] transition-colors text-red-400">
                  Exclusive Privilege Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Services */}
          <div>
            <h4 className="text-xs font-serif uppercase tracking-[0.2em] text-[#F3E5AB] mb-4">
              CONCIERGE
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-light">
              <li>
                <Link href="/account" className="hover:text-[#D4AF37] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#D4AF37] transition-colors">
                  Worldwide Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#D4AF37] transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">
                  Explore Shop Catalogue
                </Link>
              </li>
              <li>
                <a href="mailto:elantraa.01@gmail.com" className="hover:text-[#D4AF37] transition-colors">
                  Email: elantraa.01@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/919015342951" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">
                  WhatsApp: +91 9015342951
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Atelier */}
          <div>
            <h4 className="text-xs font-serif uppercase tracking-[0.2em] text-[#F3E5AB] mb-4">
              ATELIER & LEGAL
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-light">
              <li>
                <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#D4AF37] transition-colors font-medium">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-light">
          <p>© 2026 ELANTRAA. ALL RIGHTS RESERVED.</p>

          {/* Payment Badges */}
          <div className="flex items-center space-x-3 text-[10px] text-gray-400 uppercase tracking-widest">
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">VISA</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">MASTERCARD</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">RAZORPAY</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">UPI</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
