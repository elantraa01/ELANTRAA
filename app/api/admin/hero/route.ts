import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    let hero = await prisma.heroBanner.findUnique({ where: { id: "default" } });
    if (!hero) {
      hero = await prisma.heroBanner.create({
        data: {
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
        },
      });
    }
    return NextResponse.json({ hero });
  } catch (error) {
    console.error("GET /api/admin/hero error:", error);
    return NextResponse.json({ error: "Failed to fetch hero banner" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { announcement, tagline, title, highlight, description, buttonText, buttonLink, bgImage, bgVideo } = body;

    const updated = await prisma.heroBanner.upsert({
      where: { id: "default" },
      update: {
        ...(announcement !== undefined && { announcement }),
        ...(tagline !== undefined && { tagline }),
        ...(title !== undefined && { title }),
        ...(highlight !== undefined && { highlight }),
        ...(description !== undefined && { description }),
        ...(buttonText !== undefined && { buttonText }),
        ...(buttonLink !== undefined && { buttonLink }),
        ...(bgImage !== undefined && { bgImage }),
        ...(bgVideo !== undefined && { bgVideo: bgVideo || null }),
      },
      create: {
        id: "default",
        announcement: announcement || "COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000",
        tagline: tagline || "AUTUMN / WINTER 2026 COLLECTION",
        title: title || "ELANTRAA",
        highlight: highlight || "& Timeless Elegance",
        description:
          description ||
          "Immerse yourself in handcrafted silk gowns, tailored silhouettes, and intricate metallic embroidery designed for the discerning individual.",
        buttonText: buttonText || "Explore Collection",
        buttonLink: buttonLink || "/shop",
        bgImage: bgImage || "/images/hero/hero_banner.png",
        bgVideo: bgVideo || null,
      },
    });

    return NextResponse.json({ hero: updated });
  } catch (error) {
    console.error("PATCH /api/admin/hero error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update hero banner";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
