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

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error("Categories GET Error:", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}

