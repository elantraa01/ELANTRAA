import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#9b7a1d] font-semibold">Concierge Service</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950">Contact Us</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E8E2D9] shadow-sm space-y-6">
          <div className="space-y-4 font-serif text-slate-800 text-lg">
            <div>
              <p className="text-xs font-sans uppercase tracking-wider text-slate-500 font-semibold mb-1">Phone</p>
              <a href="tel:+919315098575" className="hover:text-[#9b7a1d] transition-colors font-bold">
                +91 9315098575
              </a>
            </div>

            <div>
              <p className="text-xs font-sans uppercase tracking-wider text-slate-500 font-semibold mb-1">Email</p>
              <a href="mailto:elantraa.01@gmail.com" className="hover:text-[#9b7a1d] transition-colors font-bold">
                elantraa.01@gmail.com
              </a>
            </div>

            <div>
              <p className="text-xs font-sans uppercase tracking-wider text-slate-500 font-semibold mb-1">Social</p>
              <a href="https://www.instagram.com/elantraaofficial?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="hover:text-[#9b7a1d] transition-colors">
                Instagram: @elantraaofficial
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
