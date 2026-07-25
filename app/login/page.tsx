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
        // Trigger guest cart merge on login
        await mergeCartOnLogin("user_client_demo");
        router.push("/account");
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setLoading(true);
    setErrorMessage(null);

    const res = await signIn("credentials", {
      redirect: false,
      email: demoEmail,
      password: "password123",
    });

    setLoading(false);
    if (res?.ok) {
      await mergeCartOnLogin(demoEmail === "admin@elantraa.com" ? "user_admin_demo" : "user_client_demo");
      router.push("/account");
    } else {
      setErrorMessage(res?.error || "Demo login failed");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/account" });
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
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm flex items-center justify-center space-x-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-[#FAF8F5] px-3 text-[10px] uppercase tracking-widest text-gray-400 font-semibold absolute">
                OR EMAIL
              </span>
            </div>

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
                  placeholder="client@elantraa.com"
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

            {/* Fast Demo Login Trigger */}
            <div className="pt-4 border-t border-gray-200 text-center space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold block">
                Instant One-Click Demo Logins
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDemoLogin("client@elantraa.com")}
                  className="flex-1 py-2 px-2 bg-white border border-gray-200 hover:border-[#C9A648] rounded text-[11px] font-medium text-gray-700 hover:text-[#C9A648] transition-colors"
                >
                  Client Demo
                </button>
                <button
                  onClick={() => handleDemoLogin("admin@elantraa.com")}
                  className="flex-1 py-2 px-2 bg-white border border-gray-200 hover:border-[#C9A648] rounded text-[11px] font-medium text-gray-700 hover:text-[#C9A648] transition-colors"
                >
                  Admin Demo
                </button>
              </div>
            </div>
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
