import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (collections.length === 0) {
      // Fallback initial collections if DB is empty
      const defaultCollections = [
        {
          id: "coll-1",
          title: "Dresses & Evening Gowns",
          subtitle: "Handcrafted Silk & Satin Silhouettes",
          image: "/images/collections/dresses.png",
          slug: "dresses",
          itemCount: "12 PIECES",
          isFeatured: true,
        },
        {
          id: "coll-2",
          title: "Luxury Ethnic Wear",
          subtitle: "Royal Embroidered Sarees & Lehengas",
          image: "/images/collections/ethnic.png",
          slug: "ethnic-wear",
          itemCount: "15 PIECES",
          isFeatured: true,
        },
        {
          id: "coll-3",
          title: "Menswear Couture",
          subtitle: "Bespoke Royal Sherwanis & Jackets",
          image: "/images/collections/menswear.png",
          slug: "menswear",
          itemCount: "8 PIECES",
          isFeatured: true,
        },
        {
          id: "coll-4",
          title: "Accessories & Jewelry",
          subtitle: "Fine Metallic Clutches & Artisan Pieces",
          image: "/images/collections/accessories.png",
          slug: "accessories",
          itemCount: "20 PIECES",
          isFeatured: true,
        },
      ];
      return NextResponse.json({ collections: defaultCollections });
    }

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
