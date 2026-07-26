"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { mergeCartOnLogin } = useCart();

  useEffect(() => {
    if (session?.user) {
      router.replace("/account");
    }
  }, [session, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        router.push("/account");
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Breadcrumb Navigation */}
        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Sign In</span>
            </nav>
          </div>
        </div>

        <main className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="text-center mb-8">
            <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
              WELCOME BACK
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mt-1 tracking-tight">
              Sign In To ELANTRAA
            </h1>
            <p className="text-xs text-gray-500 font-light mt-2">
              Access your order history, saved addresses, and privilege perks.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A648]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold uppercase tracking-wider text-gray-700">
                    Password *
                  </label>
                  <a href="#" className="text-[11px] text-[#C9A648] hover:underline font-medium">
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A648]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white uppercase tracking-[0.2em] font-medium text-xs rounded-md shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            New to ELANTRAA?{" "}
            <Link href="/signup" className="text-[#C9A648] font-semibold underline hover:text-gray-900">
              Create an Account
            </Link>
          </p>
        </main>
      </div>

      <Footer />
    </div>
  );
}
