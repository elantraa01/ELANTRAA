import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b7a1d] font-semibold">Our Heritage</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950">About ELANTRAA</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#E8E2D9] shadow-sm space-y-6 leading-relaxed font-serif text-slate-700 text-base sm:text-lg">
          <p>
            ELANTRAA is an international haute couture fashion house dedicated to artisanal luxury, hand-embroidered silks, and modern bespoke tailoring.
          </p>
          <p>
            Every silhouette in our collection is crafted with painstaking attention to detail, preserving centuries-old embroidery techniques while embracing contemporary haute couture aesthetics.
          </p>
          <p>
            From fluid silk gowns to meticulously structured jackets, ELANTRAA embodies timeless elegance for the discerning individual.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
