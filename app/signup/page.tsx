"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.message
            ? `${data.error || "Failed to create account."} — ${data.message}`
            : data.error || "Failed to create account."
        );
        setLoading(false);
        return;
      }

      // Auto sign in user after successful registration
      const authRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      setLoading(false);
      if (authRes?.ok) {
        router.push("/account");
      } else {
        router.push("/login");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
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
              <span className="text-gray-900 font-medium">Create Account</span>
            </nav>
          </div>
        </div>

        <main className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="text-center mb-8">
            <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
              JOIN THE PRIVÉ CLUB
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mt-1 tracking-tight">
              Create An Account
            </h1>
            <p className="text-xs text-gray-500 font-light mt-2">
              Enjoy 10% off your inaugural order, bespoke fitting, and fast checkout.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSignup} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Radhika Kapoor"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A648]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A648]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A648]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A648]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C9A648] to-[#AA771C] text-white uppercase tracking-[0.2em] font-medium text-xs rounded-md shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#C9A648] font-semibold underline hover:text-gray-900">
              Sign In
            </Link>
          </p>
        </main>
      </div>

      <Footer />
    </div>
  );
}
