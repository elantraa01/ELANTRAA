import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json({ wishlist: [] });
    }

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email: userEmail! },
    });

    if (!user) {
      return NextResponse.json({ wishlist: [] });
    }

    const wishlistRecords = await prisma.wishlist.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            discountPrice: true,
            images: true,
            sizes: true,
            colors: true,
            isFeatured: true,
            description: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = wishlistRecords.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      discountPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
      images: item.product.images,
      category: item.product.category?.name || "",
      sizes: item.product.sizes.length > 0 ? item.product.sizes : ["S", "M", "L"],
      colors: item.product.colors.length > 0 ? item.product.colors : [],
      isNewArrival: item.product.isFeatured,
      isBestSeller: item.product.isFeatured,
      description: item.product.description || "",
      rating: 0,
      reviewCount: 0,
    }));

    return NextResponse.json({ wishlist: products });
  } catch (error) {
    console.error("GET /api/wishlist Error:", error);
    return NextResponse.json({ wishlist: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email: userEmail! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          productId,
        },
      });
    }

    // Return updated wishlist
    const updatedRecords = await prisma.wishlist.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            discountPrice: true,
            images: true,
            sizes: true,
            colors: true,
            isFeatured: true,
            description: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = updatedRecords.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      discountPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
      images: item.product.images,
      category: item.product.category?.name || "",
      sizes: item.product.sizes.length > 0 ? item.product.sizes : ["S", "M", "L"],
      colors: item.product.colors.length > 0 ? item.product.colors : [],
      isNewArrival: item.product.isFeatured,
      isBestSeller: item.product.isFeatured,
      description: item.product.description || "",
      rating: 0,
      reviewCount: 0,
    }));

    return NextResponse.json({ wishlist: products, isWishlisted: !existing });
  } catch (error) {
    console.error("POST /api/wishlist Error:", error);
    return NextResponse.json({ error: "Failed to update wishlist in DB" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email: userEmail! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        productId,
      },
    });

    return GET();
  } catch (error) {
    console.error("PUT /api/wishlist Error:", error);
    return NextResponse.json({ error: "Failed to save wishlist item" }, { status: 500 });
  }
}
