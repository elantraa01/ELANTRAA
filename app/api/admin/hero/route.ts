import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role;
  if (!session || userRole !== "ADMIN") {
    return false;
  }
  return true;
}

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    let hero = await prisma.heroBanner.findUnique({ where: { id: "default" } });
    if (!hero) {
      hero = await prisma.heroBanner.create({
        data: {
          id: "default",
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
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { tagline, title, highlight, description, buttonText, buttonLink, bgImage } = body;

    const updated = await prisma.heroBanner.upsert({
      where: { id: "default" },
      update: {
        ...(tagline !== undefined && { tagline }),
        ...(title !== undefined && { title }),
        ...(highlight !== undefined && { highlight }),
        ...(description !== undefined && { description }),
        ...(buttonText !== undefined && { buttonText }),
        ...(buttonLink !== undefined && { buttonLink }),
        ...(bgImage !== undefined && { bgImage }),
      },
      create: {
        id: "default",
        tagline: tagline || "AUTUMN / WINTER 2026 COLLECTION",
        title: title || "ELANTRAA",
        highlight: highlight || "& Timeless Elegance",
        description:
          description ||
          "Immerse yourself in handcrafted silk gowns, tailored silhouettes, and intricate metallic embroidery designed for the discerning individual.",
        buttonText: buttonText || "Explore Collection",
        buttonLink: buttonLink || "/shop",
        bgImage: bgImage || "/images/hero/hero_banner.png",
      },
    });

    return NextResponse.json({ hero: updated });
  } catch (error) {
    console.error("PATCH /api/admin/hero error:", error);
    return NextResponse.json({ error: "Failed to update hero banner" }, { status: 500 });
  }
}
