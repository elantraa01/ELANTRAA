import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#C9A648",
          white: "#FFFFFF",
        },
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surface: "var(--color-surface)",
        accent: "var(--color-accent)",
        ink: "var(--color-ink)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        logo: ["var(--font-logo)", "Georgia", "serif"],
        body: ["var(--font-body)", "Arial", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 45s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
