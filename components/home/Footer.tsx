"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  }

  return (
    <footer className="bg-[#121212] text-[#E5E0D8] font-sans border-t border-[#C9A648]/20 selection:bg-[#C9A648] selection:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Main Grid: 4 Compact Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 border-b border-white/10">
          
          {/* Column 1: Brand & Socials (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <Link href="/" className="inline-block">
              <div className="relative w-36 h-10">
                <Image
                  src="/images/logo/logo.png"
                  alt="ELANTRAA"
                  fill
                  className="object-contain object-left brightness-125"
                />
              </div>
            </Link>
            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
              Artisanal craftsmanship, timeless silhouettes, and handcrafted luxury designed for the modern individual.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37] text-gray-300 hover:text-[#D4AF37] flex items-center justify-center transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://wa.me/919315098575"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37] text-gray-300 hover:text-[#D4AF37] flex items-center justify-center transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
              </a>

              <a
                href="mailto:elantraa.01@gmail.com"
                aria-label="Email"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37] text-gray-300 hover:text-[#D4AF37] flex items-center justify-center transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 font-light">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new-arrivals" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=best-sellers" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Client Care
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 font-light">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Newsletter
            </h4>
            <p className="text-xs text-gray-400 font-light">
              Subscribe for exclusive previews and private sale invitations.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/15 focus:border-[#D4AF37] rounded px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black font-semibold text-xs uppercase tracking-wider rounded hover:opacity-90 transition-opacity shrink-0"
              >
                Join
              </button>
            </form>

            {subscribed && (
              <p className="text-[11px] text-emerald-400 animate-in fade-in">
                ✓ Thank you for subscribing to ELANTRAA!
              </p>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compact Policy Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-light">
          <p>© {new Date().getFullYear()} ELANTRAA. All rights reserved.</p>
          
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/shipping" className="hover:text-gray-300 transition-colors">
              Shipping
            </Link>
            <span>•</span>
            <Link href="/returns" className="hover:text-gray-300 transition-colors">
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
