import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true,
      },
      orderBy: { name: "asc" },
    });

    if (categories && categories.length > 0) {
      return NextResponse.json({ categories });
    }

    // Fallback if database table is currently empty
    const fallbackCategories = [
      { id: "cat-1", name: "Women", slug: "women", subcategories: [] },
      { id: "cat-2", name: "Men", slug: "men", subcategories: [] },
      { id: "cat-3", name: "Lehenga choli", slug: "lehenga-choli", subcategories: [] },
      { id: "cat-4", name: "saree", slug: "saree", subcategories: [] },
      { id: "cat-5", name: "Dresses", slug: "dresses", subcategories: [] },
      { id: "cat-6", name: "Tops & Kurtas", slug: "tops", subcategories: [] },
      { id: "cat-7", name: "Shirts", slug: "shirts", subcategories: [] },
      { id: "cat-8", name: "Outerwear", slug: "outerwear", subcategories: [] },
      { id: "cat-9", name: "Accessories", slug: "accessories", subcategories: [] },
    ];

    return NextResponse.json({ categories: fallbackCategories });
  } catch (error) {
    console.error("Categories GET Error:", error);
    const fallbackCategories = [
      { id: "cat-1", name: "Women", slug: "women", subcategories: [] },
      { id: "cat-2", name: "Men", slug: "men", subcategories: [] },
      { id: "cat-3", name: "Lehenga choli", slug: "lehenga-choli", subcategories: [] },
      { id: "cat-4", name: "saree", slug: "saree", subcategories: [] },
      { id: "cat-5", name: "Dresses", slug: "dresses", subcategories: [] },
      { id: "cat-6", name: "Tops & Kurtas", slug: "tops", subcategories: [] },
      { id: "cat-7", name: "Shirts", slug: "shirts", subcategories: [] },
      { id: "cat-8", name: "Outerwear", slug: "outerwear", subcategories: [] },
      { id: "cat-9", name: "Accessories", slug: "accessories", subcategories: [] },
    ];
    return NextResponse.json({ categories: fallbackCategories });
  }
}

