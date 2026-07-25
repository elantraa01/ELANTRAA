import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_HERO = {
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
  updatedAt: new Date(),
};

export async function GET() {
  try {
    let hero = await prisma.heroBanner.findUnique({ where: { id: "default" } });
    if (!hero) {
      hero = DEFAULT_HERO;
    }
    return NextResponse.json({ hero });
  } catch (error) {
    console.error("GET /api/hero error:", error);
    return NextResponse.json({ hero: DEFAULT_HERO }, { status: 200 });
  }
}
