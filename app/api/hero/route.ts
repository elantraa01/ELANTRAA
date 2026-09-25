import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const defaultHero = {
  id: "default",
  announcement: "COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000",
  tagline: "AUTUMN / WINTER 2026 COLLECTION",
  title: "ELANTRAA",
  highlight: "& Timeless Elegance",
  description:
    "Immerse yourself in handcrafted silk gowns, tailored silhouettes, and intricate metallic embroidery designed for the discerning individual.",
  buttonText: "Explore Collection",
  buttonLink: "/shop",
  bgImage: "/images/hero/hero_banner.png",
  bgImages: [],
  bgVideo: null,
};

function normalizeButtonLink(link?: string | null): string {
  if (!link) return "/shop";
  const trimmed = link.trim();
  if (
    trimmed === "" ||
    trimmed.toLowerCase() === "shop now" ||
    trimmed.toLowerCase() === "/shop now" ||
    trimmed.toLowerCase() === "shop"
  ) {
    return "/shop";
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
}

export async function GET() {
  try {
    const hero = await prisma.heroBanner.findUnique({ where: { id: "default" } });
    const activeHero = hero || defaultHero;
    return NextResponse.json({
      hero: {
        ...activeHero,
        buttonLink: normalizeButtonLink(activeHero.buttonLink),
      },
    });
  } catch (error) {
    console.error("GET /api/hero error:", error);
    return NextResponse.json({ hero: defaultHero }, { status: 200 });
  }
}
