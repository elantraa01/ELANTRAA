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
      const cleanSlug = categorySlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const cleanName = cleanSlug.replace(/-/g, " ");

      if (cleanSlug === "new-arrivals") {
        whereClause.isNewArrival = true;
      } else if (cleanSlug === "sale") {
        whereClause.discountPrice = { not: null };
      } else {
        whereClause.category = {
          OR: [
            { slug: { equals: cleanSlug, mode: "insensitive" } },
            { name: { equals: cleanName, mode: "insensitive" } },
            { parentCategory: { slug: { equals: cleanSlug, mode: "insensitive" } } },
            { parentCategory: { name: { equals: cleanName, mode: "insensitive" } } },
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
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        discountPrice: true,
        sizes: true,
        colors: true,
        tags: true,
        images: true,
        stock: true,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        isActive: true,
        isReturnable: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            slug: true,
            parentCategory: {
              select: {
                name: true,
                slug: true,
              },
            },
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
          : 4.8;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        category: p.category?.name || "",
        categorySlug: p.category?.slug || "",
        parentCategory: p.category?.parentCategory?.name || null,
        parentCategorySlug: p.category?.parentCategory?.slug || null,
        sizes: p.sizes,
        colors: p.colors,
        tags: p.tags,
        images: p.images,
        stock: p.stock,
        isFeatured: Boolean(p.isFeatured),
        isNewArrival: p.isNewArrival !== false,
        isBestSeller: Boolean(p.isBestSeller),
        rating: p.reviews.length > 0 ? Math.round(avgRating * 10) / 10 : 0,
        reviewCount: p.reviews.length,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.warn("Products GET primary query error, using fallback:", error);
    try {
      // Fallback query for when DB schema is missing newly added columns (like tags, isNewArrival, isBestSeller)
      const products = await prisma.product.findMany({
        where: { isActive: true },
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
          isActive: true,
          createdAt: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedProducts = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        category: p.category?.name || "",
        categorySlug: p.category?.slug || "",
        parentCategory: null,
        parentCategorySlug: null,
        sizes: p.sizes,
        colors: p.colors,
        tags: [],
        images: p.images,
        stock: p.stock,
        isFeatured: Boolean(p.isFeatured),
        isNewArrival: true,
        isBestSeller: false,
        rating: 0,
        reviewCount: 0,
        createdAt: p.createdAt.toISOString(),
      }));

      return NextResponse.json({ products: formattedProducts });
    } catch (fallbackError) {
      console.error("Products GET Fallback Error:", fallbackError);
      return NextResponse.json({ products: [] });
    }
  }
}
