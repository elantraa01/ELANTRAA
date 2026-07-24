import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parentCategory: true,
        subcategories: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentCategoryId: cat.parentCategoryId,
      parentCategoryName: cat.parentCategory?.name || null,
      subcategoriesCount: cat.subcategories.length,
      productsCount: cat._count.products,
    }));

    return NextResponse.json({ categories: formatted });
  } catch (error) {
    console.error("Admin Categories GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;
    if (session && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, parentCategoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanSlug =
      slug && slug.trim()
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    // Check slug collision
    const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
    const finalSlug = existing ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;

    const newCategory = await prisma.category.create({
      data: {
        name: cleanName,
        slug: finalSlug,
        parentCategoryId: parentCategoryId || null,
      },
      include: {
        parentCategory: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        parentCategoryId: newCategory.parentCategoryId,
        parentCategoryName: newCategory.parentCategory?.name || null,
        subcategoriesCount: 0,
        productsCount: newCategory._count.products,
      },
    });
  } catch (error) {
    console.error("Admin Category POST Error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;
    if (session && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, slug, parentCategoryId } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name && name.trim()) {
      updateData.name = name.trim();
    }
    if (slug && slug.trim()) {
      updateData.slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }
    if (parentCategoryId !== undefined) {
      updateData.parentCategoryId = parentCategoryId || null;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parentCategory: true,
        subcategories: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        parentCategoryId: updated.parentCategoryId,
        parentCategoryName: updated.parentCategory?.name || null,
        subcategoriesCount: updated.subcategories.length,
        productsCount: updated._count.products,
      },
    });
  } catch (error) {
    console.error("Admin Category PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;
    if (session && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Check if category has products
    const prodCount = await prisma.product.count({ where: { categoryId: id } });
    if (prodCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category containing ${prodCount} active product(s). Please reassign or delete products first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Admin Category DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
