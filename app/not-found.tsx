import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
          <span className="block text-xs font-serif tracking-[0.3em] uppercase text-[#C9A648] font-bold">
            ERROR 404
          </span>

          <h1 className="text-4xl sm:text-6xl font-serif text-gray-900 mt-2 tracking-tight">
            Page Not Found
          </h1>

          <div className="w-12 h-[2px] bg-[#C9A648] mx-auto my-6" />

          <p className="text-sm text-gray-600 font-light max-w-md mx-auto leading-relaxed">
            The piece or page you are seeking does not exist or has been relocated to another sanctuary in our shop catalogue.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="px-8 py-3.5 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-[0.2em] rounded shadow hover:bg-[#C9A648] hover:text-white transition-colors"
            >
              Return To Home
            </Link>

            <Link
              href="/shop"
              className="px-8 py-3.5 bg-white text-gray-800 border border-gray-300 text-xs font-medium uppercase tracking-[0.2em] rounded hover:border-[#C9A648] transition-colors"
            >
              Explore Shop Catalogue
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
