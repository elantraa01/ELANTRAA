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
        <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96">
          <Image
            src="/images/logo/logo.png"
            alt="ELANTRAA Logo"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>

        {/* Shimmer Bar */}
        <div className="w-32 sm:w-48 h-1 rounded-full overflow-hidden mt-2">
          <div className="w-full h-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
