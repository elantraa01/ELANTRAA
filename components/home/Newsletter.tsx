"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
    }, 800);
  };

  return (
    <section className="py-20 sm:py-24 bg-[#FAF8F5] relative border-t border-b border-[#C9A648]/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Luxury Gold Ornament */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-[1px] bg-[#C9A648]" />
          <span className="text-[#C9A648] text-xs font-serif">✦ ELANTRAA PRIVÉ ✦</span>
          <div className="w-10 h-[1px] bg-[#C9A648]" />
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 tracking-tight">
          Join The ELANTRAA Privé Club
        </h2>

        <p className="text-sm sm:text-base text-gray-600 font-light mt-3 max-w-xl mx-auto">
          Subscribe to receive private invitations to new haute couture drops, trunk shows, and enjoy <strong className="font-semibold text-gray-900">10% off</strong> your inaugural order.
        </p>

        {/* Subscription Form */}
        <div className="mt-8 max-w-md mx-auto">
          {subscribed ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium animate-in fade-in duration-500">
              ✓ Welcome to ELANTRAA Privé! Check your inbox for your 10% welcome code.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3.5 bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:border-[#C9A648] focus:ring-1 focus:ring-[#C9A648] text-sm placeholder-gray-400 font-sans shadow-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white transition-all duration-300 font-medium text-xs tracking-[0.2em] uppercase rounded shadow-md disabled:opacity-50"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}

          <p className="text-[11px] text-gray-400 mt-3 font-light">
            By subscribing you agree to our Privacy Policy. You may unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
