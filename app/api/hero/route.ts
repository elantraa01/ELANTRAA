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

export async function GET() {
  try {
    const hero = await prisma.heroBanner.findUnique({ where: { id: "default" } });
    return NextResponse.json({ hero: hero || defaultHero });
  } catch (error) {
    console.error("GET /api/hero error:", error);
    return NextResponse.json({ hero: defaultHero }, { status: 200 });
  }
}
