import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const categorySlug = searchParams.get("category");
  const isFeatured = searchParams.get("isFeatured") === "true";
  const isSale = searchParams.get("isSale") === "true";
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "newest";
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

  try {
    const whereClause: Record<string, unknown> = {
      isActive: true,
    };

    if (isFeatured) {
      whereClause.isFeatured = true;
    }

    if (isSale) {
      whereClause.discountPrice = { not: null };
    }

    if (maxPrice) {
      whereClause.price = { lte: maxPrice };
    }

    if (categorySlug && categorySlug !== "all") {
      const cleanSlug = categorySlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      const cleanName = categorySlug.replace(/-/g, " ");

      if (cleanSlug === "new-arrivals") {
        whereClause.isFeatured = true;
      } else if (cleanSlug === "sale") {
        whereClause.discountPrice = { not: null };
      } else if (cleanSlug === "ethnic" || cleanSlug === "ethnic-wear") {
        whereClause.category = {
          OR: [
            { slug: { in: ["lehenga-choli", "saree", "anarkali-suits", "kurta-sets"] } },
            { name: { contains: "Lehenga", mode: "insensitive" } },
            { name: { contains: "Saree", mode: "insensitive" } },
            { name: { contains: "Anarkali", mode: "insensitive" } },
            { name: { contains: "Kurta", mode: "insensitive" } },
          ],
        };
      } else if (cleanSlug === "menswear") {
        whereClause.category = {
          OR: [
            { slug: "men" },
            { parentCategory: { slug: "men" } },
            { slug: "shirts" },
            { slug: "kurta-sets" },
          ],
        };
      } else {
        whereClause.category = {
          OR: [
            { slug: { equals: cleanSlug, mode: "insensitive" } },
            { name: { contains: cleanName, mode: "insensitive" } },
            { parentCategory: { slug: { equals: cleanSlug, mode: "insensitive" } } },
            { parentCategory: { name: { contains: cleanName, mode: "insensitive" } } },
          ],
        };
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Determine sorting order
    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    if (sortBy === "price-low") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price-high") {
      orderBy = { price: "desc" };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          include: {
            parentCategory: true,
          },
        },
        reviews: true,
      },
      orderBy,
    });

    // Format products with rating and reviews count
    const formattedProducts = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
          : 0;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        category: p.category?.name || "Uncategorized",
        categorySlug: p.category?.slug || "uncategorized",
        parentCategory: p.category?.parentCategory?.name || null,
        parentCategorySlug: p.category?.parentCategory?.slug || null,
        sizes: p.sizes,
        colors: p.colors,
        images: p.images.length > 0 ? p.images : ["/images/collections/dresses.png"],
        stock: p.stock,
        isFeatured: p.isFeatured,
        isNewArrival: p.isFeatured || p.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        isBestSeller: p.stock > 10,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Products GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
