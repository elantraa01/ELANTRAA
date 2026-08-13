import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b7a1d] font-semibold">Stories & Journal</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950">ELANTRAA Journal</h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <article className="bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-sm space-y-3">
            <span className="text-xs text-[#9b7a1d] font-semibold uppercase tracking-wider">Couture Craftsmanship</span>
            <h2 className="text-xl font-serif font-bold text-slate-950">The Art of Hand-Embroidered Silks</h2>
            <p className="text-sm text-slate-600 font-serif leading-relaxed">
              Explore how our master artisans spend over 120 hours crafting complex metallic embroidery for haute couture gowns.
            </p>
          </article>

          <article className="bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-sm space-y-3">
            <span className="text-xs text-[#9b7a1d] font-semibold uppercase tracking-wider">Style Guide</span>
            <h2 className="text-xl font-serif font-bold text-slate-950">Autumn / Winter Trends</h2>
            <p className="text-sm text-slate-600 font-serif leading-relaxed">
              Discover timeless silhouettes, rich earth tones, and luxurious layering for this season&apos;s evening wear.
            </p>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
