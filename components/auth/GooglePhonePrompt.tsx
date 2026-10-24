"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useSession } from "next-auth/react";

const DISMISS_KEY = "elantraa_phone_prompt_dismissed";

export default function GooglePhonePrompt() {
  const { data: session, status, update } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || status !== "authenticated" || !session?.user) return;

    // Check if dismissed in this session
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "true") {
        return;
      }
    } catch {}

    // Check if user already has phone
    const userWithPhone = session.user as { phone?: string | null };
    if (userWithPhone.phone && userWithPhone.phone.trim().length >= 10) {
      return;
    }

    // Verify directly with backend profile to ensure it is not already filled
    let cancelled = false;
    async function checkProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.phone && data.user.phone.trim().length >= 10) {
            return;
          }
        }
        // Delay opening slightly for smooth UX
        if (!cancelled) {
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn("Failed checking profile phone status", err);
      }
    }

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [mounted, status, session]);

  const handleDismiss = () => {
    setIsOpen(false);
    setError(null);
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {}
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const formatted = phone.trim().startsWith("+")
        ? phone.trim()
        : `+91 ${phone.trim()}`;

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save phone number. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Notify account page and listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("elantraa-user-updated", {
            detail: { phone: formatted },
          })
        );
      }

      // Refresh NextAuth session
      if (update) {
        await update();
      }

      // Mark dismissed and close
      try {
        sessionStorage.setItem(DISMISS_KEY, "true");
      } catch {}

      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 1200);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl border border-[#C9A648]/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-md w-full p-6 sm:p-8 overflow-hidden z-10 text-center animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-gradient-to-b from-[#C9A648]/20 via-[#C9A648]/5 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center text-sm font-semibold"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Brand Emblem */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white border border-[#C9A648]/40 shadow-sm flex items-center justify-center p-2 relative z-10">
          <Image
            src="/images/logo/logo.png"
            alt="ELANTRAA"
            width={38}
            height={38}
            className="object-contain"
            priority
          />
        </div>

        {/* Header Text */}
        <span className="text-[10px] tracking-[0.25em] text-[#C9A648] uppercase font-bold">
          ✦ WELCOME TO ELANTRAA ✦
        </span>
        <h2 className="text-xl sm:text-2xl font-serif text-gray-900 mt-1 tracking-tight">
          Add Your Mobile Number
        </h2>
        <p className="text-xs text-gray-500 font-light mt-1.5 max-w-xs mx-auto leading-relaxed">
          Stay updated with real-time WhatsApp order tracking, dispatch notifications, and bespoke fitting updates.
        </p>

        {/* Success Alert */}
        {success ? (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-center gap-2 animate-in fade-in">
            <span>✓</span>
            <span>Mobile number saved to your account!</span>
          </div>
        ) : (
          <form onSubmit={handleSavePhone} className="mt-5 space-y-4 text-left">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1.5 text-[11px]">
                Mobile Number <span className="text-[#C9A648]">*</span>
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-xs font-medium tracking-wide shrink-0">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="98765 43210"
                  maxLength={14}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-gray-300 rounded-r-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C9A648] focus:bg-white focus:ring-1 focus:ring-[#C9A648]/30 transition-all text-xs sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] hover:brightness-105 text-white uppercase tracking-[0.2em] font-medium text-xs rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save & Continue</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors pt-1 font-light"
            >
              Skip for Now
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
