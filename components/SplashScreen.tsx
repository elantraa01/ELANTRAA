"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [stage, setStage] = useState<"enter" | "visible" | "exit" | "done">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("visible"), 600);
    const t2 = setTimeout(() => setStage("exit"), 1400);
    const t3 = setTimeout(() => setStage("done"), 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (stage === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-in-out select-none ${
        stage === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-out transform ${
          stage === "enter"
            ? "opacity-0 scale-90 translate-y-2"
            : stage === "visible"
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-105 -translate-y-2"
        }`}
      >
        {/* Brand Logo Image */}
        <div className="relative mb-4 w-20 h-20 sm:w-24 sm:h-24">
          <Image
            src="/images/logo/logo.png"
            alt="ELANTRAA Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-[0.25em] font-light bg-gradient-to-r from-[#AA771C] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent uppercase">
          ELANTRAA
        </h1>
      </div>
    </div>
  );
}
