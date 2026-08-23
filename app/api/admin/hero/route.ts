import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const hero = await prisma.heroBanner.findUnique({ where: { id: "default" } });
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
    const {
      announcement,
      tagline,
      title,
      highlight,
      description,
      buttonText,
      buttonLink,
      bgImage,
      bgImages,
      bgVideo,
    } = body;

    const sanitizedBgImages: string[] = Array.isArray(bgImages)
      ? bgImages.map((img: unknown) => (typeof img === "string" ? img.trim() : "")).filter(Boolean)
      : [];

    const primaryImage =
      sanitizedBgImages.length > 0
        ? sanitizedBgImages[0]
        : typeof bgImage === "string" && bgImage.trim()
        ? bgImage.trim()
        : "";

    if (!title?.trim() || !primaryImage) {
      return NextResponse.json(
        { error: "Hero title and at least one background image are required." },
        { status: 400 }
      );
    }

    const finalBgImages = sanitizedBgImages.length > 0 ? sanitizedBgImages : [primaryImage];

    const updated = await prisma.heroBanner.upsert({
      where: { id: "default" },
      update: {
        announcement: announcement || "",
        tagline: tagline || "",
        title: title.trim(),
        highlight: highlight || "",
        description: description || "",
        buttonText: buttonText || "Shop",
        buttonLink: buttonLink || "/shop",
        bgImage: primaryImage,
        bgImages: finalBgImages,
        bgVideo: bgVideo || null,
      },
      create: {
        id: "default",
        announcement: announcement || "",
        tagline: tagline || "",
        title: title.trim(),
        highlight: highlight || "",
        description: description || "",
        buttonText: buttonText || "Shop",
        buttonLink: buttonLink || "/shop",
        bgImage: primaryImage,
        bgImages: finalBgImages,
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
