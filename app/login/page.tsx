"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { mergeCartOnLogin } = useCart();
  const [callbackUrl, setCallbackUrl] = useState("/account");

  useEffect(() => {
    if (session?.user) {
      router.replace(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") || "/account");
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setErrorMessage(res.error || "Invalid email or password.");
      } else if (res?.ok) {
        await mergeCartOnLogin(email);
        router.push(callbackUrl);
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Ambient Top Glow */}
        <div className="relative overflow-hidden py-10 sm:py-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gradient-to-b from-[#C9A648]/10 via-[#C9A648]/5 to-transparent blur-3xl pointer-events-none" />

          <main className="max-w-md mx-auto px-4 sm:px-6 relative z-10 w-full">
            {/* Header / Brand Title */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white border border-[#C9A648]/40 shadow-sm flex items-center justify-center p-2">
                <Image
                  src="/images/logo/logo.png"
                  alt="ELANTRAA"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-[0.3em] text-[#C9A648] uppercase font-bold">
                SIGN IN
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 mt-1 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs text-gray-500 font-light mt-1.5">
                Sign in to access your wishlist, saved addresses & orders.
              </p>
            </div>

            {/* Main Luxury Login Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] space-y-5">
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1-Click Fast Google Sign In (Top for High Conversion & Reach) */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 hover:border-[#C9A648] text-xs font-semibold tracking-wider uppercase rounded-lg shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] group"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="group-hover:text-gray-900 transition-colors">
                    Continue with Google
                  </span>
                </button>
              </div>

              {/* Minimal Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                  or with email
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleCredentialsLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1.5 text-[11px]">
                    Email Address <span className="text-[#C9A648]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. client@elantraa.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C9A648] focus:bg-white focus:ring-1 focus:ring-[#C9A648]/30 transition-all text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-semibold uppercase tracking-wider text-gray-700 text-[11px]">
                      Password <span className="text-[#C9A648]">*</span>
                    </label>
                    <a
                      href={`https://wa.me/919015342951?text=${encodeURIComponent(
                        "Hi ELANTRAA, I need help resetting my account password."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#C9A648] hover:underline font-medium"
                    >
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#FAF8F5] border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C9A648] focus:bg-white focus:ring-1 focus:ring-[#C9A648]/30 transition-all text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#171717] hover:bg-[#C9A648] text-[#D4AF37] hover:text-white uppercase tracking-[0.2em] font-medium text-xs rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Account</span>
                  )}
                </button>
              </form>

              {/* Benefits Pill */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-light">
                <span className="flex items-center gap-1">
                  <span className="text-[#C9A648]">✦</span> 10% First Order
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[#C9A648]">✦</span> Saved Wishlist
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[#C9A648]">✦</span> Order Tracking
                </span>
              </div>
            </div>

            {/* Highly Visible "Create Account" Callout Card */}
            <div className="mt-5 p-5 sm:p-6 bg-gradient-to-br from-white via-[#FAF8F5] to-amber-50/50 rounded-2xl border-2 border-[#C9A648]/40 shadow-sm text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A648]">
                  NEW TO ELANTRAA?
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A648] animate-pulse" />
              </div>
              <h2 className="text-sm sm:text-base font-serif text-gray-900 font-medium">
                Get 10% OFF On Your First Order
              </h2>
              <p className="text-xs text-gray-500 font-light max-w-xs mx-auto">
                Create an account in seconds to save your wishlist, track orders, and get your welcome discount.
              </p>
              <Link
                href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="inline-flex w-full py-3 px-4 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] hover:brightness-105 text-white text-xs font-semibold tracking-wider uppercase rounded-lg shadow-md hover:shadow-lg transition-all items-center justify-center gap-2 active:scale-[0.99] group"
              >
                <span>Create New Account</span>
                <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
              </Link>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
