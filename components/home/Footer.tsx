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
    <footer className="bg-[#FAF7F2] text-[#2C2C2C] font-sans border-t border-[#E8E2D9]">
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-12">
        
        {/* Brand Logo Arch Banner */}
        <div className="flex justify-center">
          <div className="relative w-44 h-48 sm:w-52 sm:h-56 bg-[#F2ACA0] rounded-t-full flex flex-col items-center justify-center p-6 shadow-sm overflow-hidden border border-[#E59C8F]/40">
            {/* Soft decorative background flourishes */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            
            {/* ELANTRAA Logo Image */}
            <div className="relative w-36 h-20 sm:w-40 sm:h-24 transition-transform hover:scale-105 duration-300">
              <Image
                src="/images/logo/logo.png"
                alt="ELANTRAA Logo"
                fill
                className="object-contain filter drop-shadow-sm"
              />
            </div>
            
            <p className="mt-2 text-[11px] font-serif tracking-[0.25em] uppercase text-slate-800 font-semibold">
              HAUTE COUTURE
            </p>
          </div>
        </div>

        {/* Navigation & Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 pt-4">
          
          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 tracking-wide">
              Quick links
            </h3>
            
            <ul className="space-y-3 text-sm sm:text-base text-slate-700 font-serif">
              <li>
                <Link href="/" className="hover:text-slate-950 underline decoration-slate-400 underline-offset-4 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-950 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-slate-950 transition-colors">
                  View All Products
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-slate-950 transition-colors">
                  Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 tracking-wide">
              Contact Us
            </h3>
            
            <div className="space-y-2 text-base sm:text-lg font-serif text-slate-800">
              <p>
                <a href="tel:+919315098575" className="hover:underline transition-all">
                  +91 9315098575
                </a>
              </p>
              <p>
                <a href="mailto:elantraa.01@gmail.com" className="hover:underline transition-all">
                  elantraa.01@gmail.com
                </a>
              </p>
            </div>

            {/* Instagram Icon */}
            <div className="pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-block text-slate-900 hover:text-rose-700 transition-colors"
              >
                <svg
                  className="w-8 h-8 stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Email Subscription Section */}
        <div className="pt-6 border-t border-[#E8E2D9] max-w-md mx-auto text-center space-y-4">
          <p className="text-base sm:text-lg font-serif text-slate-800">
            Subscribe to our emails
          </p>

          <form onSubmit={handleSubscribe} className="relative flex items-center">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-slate-700 focus:border-slate-950 rounded-none px-4 py-3 text-sm text-slate-900 placeholder-slate-500 font-serif outline-none transition-colors pr-12"
            />
            <button
              type="submit"
              aria-label="Submit Email"
              className="absolute right-0 top-0 bottom-0 px-4 text-slate-800 hover:text-slate-950 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          {subscribed && (
            <p className="text-xs text-emerald-700 font-medium animate-in fade-in">
              Thank you for subscribing!
            </p>
          )}
        </div>

        {/* Welcome Banner Bubble & Copyright Footer Bar */}
        <div className="pt-8 space-y-6 text-center border-t border-[#E8E2D9]">
          
          {/* Welcome Speech Bubble Banner */}
          <div className="inline-block relative">
            <div className="bg-white border border-slate-200/90 rounded-lg px-6 py-3 shadow-sm text-sm sm:text-base font-serif text-slate-800">
              Welcome to ELANTRAA, Happy Shopping
            </div>
            {/* Bubble arrow tail */}
            <div className="w-3 h-3 bg-white border-b border-r border-slate-200/90 rotate-45 mx-auto -mt-1.5" />
          </div>

          {/* Sub-footer Policy Links & Copyright */}
          <div className="text-xs sm:text-sm text-slate-600 font-serif space-y-2 leading-relaxed max-w-2xl mx-auto">
            <p>
              © {new Date().getFullYear()}, ELANTRAA ·{" "}
              <Link href="/privacy" className="hover:underline">
                Privacy policy
              </Link>
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-slate-600">
              <span>·</span>
              <Link href="/returns" className="hover:underline">
                Refund policy
              </Link>
              <span>·</span>
              <Link href="/contact" className="hover:underline">
                Contact information
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:underline">
                Terms of service
              </Link>
              <span>·</span>
              <Link href="/shipping" className="hover:underline">
                Shipping policy
              </Link>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
