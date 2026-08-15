import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const p = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        discountPrice: true,
        sizes: true,
        colors: true,
        images: true,
        stock: true,
        isFeatured: true,
        isReturnable: true,
        productInformation: true,
        deliveryTimelines: true,
        disclaimer: true,
        additionalInfo: true,
        sizeChart: true,
        sizeChartCm: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: {
            id: true,
            productId: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!p) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
        : 0;

    const formattedProduct = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      category: p.category.name,
      categorySlug: p.category.slug,
      sizes: p.sizes,
      colors: p.colors,
      images: p.images,
      stock: p.stock,
      isFeatured: p.isFeatured,
      isReturnable: p.isReturnable !== false,
      rating: p.reviews.length > 0 ? Math.round(avgRating * 10) / 10 : 0,
      reviewCount: p.reviews.length,
      productInformation: (p as { productInformation?: string | null }).productInformation || "",
      deliveryTimelines: (p as { deliveryTimelines?: string | null }).deliveryTimelines || "",
      disclaimer: (p as { disclaimer?: string | null }).disclaimer || "",
      additionalInfo: (p as { additionalInfo?: string | null }).additionalInfo || "",
      sizeChart: (p as { sizeChart?: string | null }).sizeChart || null,
      sizeChartCm: (p as { sizeChartCm?: string | null }).sizeChartCm || null,
      details: [],
      materials: "",
      careInstructions: "",
      reviews: p.reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        userName: r.user?.name || "Client",
        rating: r.rating,
        title: "",
        comment: r.comment || "",
        date: new Date(r.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        verifiedBuyer: true,
      })),
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error) {
    console.error("Product GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
