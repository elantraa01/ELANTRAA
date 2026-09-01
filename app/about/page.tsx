import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C9A648] selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Breadcrumb */}
        <div className="bg-[#FAF8F5] border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-widest font-light">
              <Link href="/" className="hover:text-[#C9A648] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Our Story</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-[#FAF8F5] to-white border-b border-gray-100 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C9A648] font-bold">
              THE ELANTRAA JOURNEY
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-normal text-gray-900 tracking-tight leading-tight">
              Our Story
            </h1>
            <p className="text-lg sm:text-2xl font-serif italic text-gray-600 font-light">
              &ldquo;From Tradition to Trend&rdquo;
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-12">
          
          {/* Lead Paragraph Quote Box */}
          <div className="bg-[#FAF8F5] border-l-4 border-[#C9A648] rounded-r-2xl p-6 sm:p-10 shadow-sm">
            <p className="text-base sm:text-xl font-serif text-gray-800 leading-relaxed italic">
              &ldquo;Elantraa was born from a simple idea — that traditional fashion should not be left behind, and modern fashion should never have to lose its roots.&rdquo;
            </p>
          </div>

          {/* Narrative Story Sections */}
          <div className="space-y-8 text-gray-700 font-light leading-relaxed text-sm sm:text-base">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
              <p>
                With a love for Indian craftsmanship, beautiful silhouettes and contemporary fashion, we created <strong className="text-gray-900 font-medium">Elantraa</strong> to bring together the charm of tradition with the ease and confidence of today’s style.
              </p>
              
              <p>
                Our collection is designed for the woman who wants to feel effortlessly stylish — whether she’s dressing for everyday life, college, work, celebrations or a special occasion.
              </p>

              <p>
                At Elantraa, we believe clothing is more than just what you wear. It is a reflection of your personality, your culture and the way you choose to express yourself.
              </p>

              <p>
                From thoughtfully designed ethnic silhouettes to modern everyday wear, every piece is created with attention to detail, comfort and style.
              </p>
            </div>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-[#FAF8F5] border border-gray-200/80 rounded-xl p-6 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#C9A648]/15 text-[#C9A648] flex items-center justify-center font-serif text-base font-semibold">
                ✦
              </div>
              <h3 className="font-serif text-base font-semibold text-gray-900">Craftsmanship</h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Celebrating Indian heritage and artisanal embroidery with modern silhouettes.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-gray-200/80 rounded-xl p-6 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#C9A648]/15 text-[#C9A648] flex items-center justify-center font-serif text-base font-semibold">
                ✦
              </div>
              <h3 className="font-serif text-base font-semibold text-gray-900">Effortless Style</h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Versatile pieces curated for everyday life, work, college, and grand celebrations.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-gray-200/80 rounded-xl p-6 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#C9A648]/15 text-[#C9A648] flex items-center justify-center font-serif text-base font-semibold">
                ✦
              </div>
              <h3 className="font-serif text-base font-semibold text-gray-900">Uniquely Yours</h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                Fashion that reflects your individuality, self-expression, and personal journey.
              </p>
            </div>
          </div>

          {/* Vision Callout Box */}
          <div className="bg-[#171717] text-white rounded-2xl p-8 sm:p-12 text-center space-y-5 border border-[#C9A648]/30">
            <p className="text-base sm:text-lg text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
              We are a growing Indian fashion brand with a vision to make fashion that feels beautiful, wearable and uniquely yours.
            </p>
            
            <div className="pt-2">
              <p className="text-sm tracking-[0.2em] text-[#D4AF37] uppercase font-semibold">
                This is just the beginning.
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif text-white mt-1">
                Elantraa — From Tradition to Trend.
              </h2>
            </div>

            <div className="pt-4">
              <Link
                href="/shop"
                className="inline-block px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-sm hover:opacity-95 transition-opacity"
              >
                Explore Collection
              </Link>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}

