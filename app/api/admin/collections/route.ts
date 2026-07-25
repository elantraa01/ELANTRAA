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
  try {
    let collections = await prisma.collection.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (collections.length === 0) {
      await prisma.collection.createMany({
        data: [
          {
            title: "Dresses & Evening Gowns",
            subtitle: "Handcrafted Silk & Satin Silhouettes",
            image: "/images/collections/dresses.png",
            slug: "dresses",
            itemCount: "12 PIECES",
            isFeatured: true,
          },
          {
            title: "Luxury Ethnic Wear",
            subtitle: "Royal Embroidered Sarees & Lehengas",
            image: "/images/collections/ethnic.png",
            slug: "ethnic-wear",
            itemCount: "15 PIECES",
            isFeatured: true,
          },
          {
            title: "Menswear Couture",
            subtitle: "Bespoke Royal Sherwanis & Jackets",
            image: "/images/collections/menswear.png",
            slug: "menswear",
            itemCount: "8 PIECES",
            isFeatured: true,
          },
          {
            title: "Accessories & Jewelry",
            subtitle: "Fine Metallic Clutches & Artisan Pieces",
            image: "/images/collections/accessories.png",
            slug: "accessories",
            itemCount: "20 PIECES",
            isFeatured: true,
          },
        ],
        skipDuplicates: true,
      });

      collections = await prisma.collection.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("GET /api/admin/collections error:", error);
    return NextResponse.json({ error: "Failed to fetch admin collections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, subtitle, image, itemCount, slug, isFeatured, targetUrl } = body;

    if (!title) {
      return NextResponse.json({ error: "Collection title is required" }, { status: 400 });
    }

    const generatedSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const collection = await prisma.collection.create({
      data: {
        title,
        slug: generatedSlug,
        subtitle: subtitle || "Curated Luxury Silhouette Collection",
        image: image || "/images/collections/dresses.png",
        itemCount: itemCount || "10 PIECES",
        targetUrl: targetUrl || null,
        isFeatured: isFeatured !== undefined ? isFeatured : true,
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/collections error:", error);
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "A collection with this title or slug already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, title, subtitle, image, itemCount, isFeatured, targetUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (image !== undefined) updateData.image = image;
    if (itemCount !== undefined) updateData.itemCount = itemCount;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("PATCH /api/admin/collections error:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/collections error:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
