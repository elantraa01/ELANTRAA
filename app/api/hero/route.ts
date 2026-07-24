import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let hero = await prisma.heroBanner.findUnique({ where: { id: "default" } });
    if (!hero) {
      hero = {
        id: "default",
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
    }
    return NextResponse.json({ hero });
  } catch (error) {
    console.error("GET /api/hero error:", error);
    return NextResponse.json(
      {
        hero: {
          id: "default",
          tagline: "AUTUMN / WINTER 2026 COLLECTION",
          title: "ELANTRAA",
          highlight: "& Timeless Elegance",
          description:
            "Immerse yourself in handcrafted silk gowns, tailored silhouettes, and intricate metallic embroidery designed for the discerning individual.",
          buttonText: "Explore Collection",
          buttonLink: "/shop",
          bgImage: "/images/hero/hero_banner.png",
          updatedAt: new Date(),
        },
      },
      { status: 200 }
    );
  }
}
