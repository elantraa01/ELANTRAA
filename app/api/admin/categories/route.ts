import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

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
      image: cat.image || "",
      isActive: cat.isActive,
      parentCategoryId: cat.parentCategoryId,
      parentCategoryName: cat.parentCategory?.name || null,
      subcategoriesCount: cat.subcategories.length,
      productsCount: cat._count.products,
    }));

    return NextResponse.json({ categories: formatted });
  } catch (error) {
    if (isMissingColumnError(error)) {
      try {
        const categories = await prisma.category.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            parentCategoryId: true,
            parentCategory: { select: { name: true } },
            subcategories: { select: { id: true } },
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
          image: "",
          isActive: true,
          parentCategoryId: cat.parentCategoryId,
          parentCategoryName: cat.parentCategory?.name || null,
          subcategoriesCount: cat.subcategories.length,
          productsCount: cat._count.products,
        }));

        return NextResponse.json({
          categories: formatted,
          warning: "Admin migration is pending. Category image/status values will appear after running the database migration.",
        });
      } catch (fallbackError) {
        console.error("Admin Categories fallback GET Error:", fallbackError);
      }
    }
    console.error("Admin Categories GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, slug, parentCategoryId, image, isActive = true } = body;

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

    const createData = {
        name: cleanName,
        slug: finalSlug,
        parentCategoryId: parentCategoryId || null,
      };

    let newCategory;
    try {
      newCategory = await prisma.category.create({
        data: {
          ...createData,
          image: image?.trim() || null,
          isActive: Boolean(isActive),
        },
        include: {
          parentCategory: { select: { name: true } },
          _count: { select: { products: true } },
        },
      });
    } catch (createError) {
      if (!isMissingColumnError(createError)) throw createError;
      newCategory = await prisma.category.create({
        data: createData,
        include: {
          parentCategory: { select: { name: true } },
          _count: { select: { products: true } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        image: "image" in newCategory ? newCategory.image || "" : "",
        isActive: "isActive" in newCategory ? newCategory.isActive : true,
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
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id, name, slug, parentCategoryId, image, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name && name.trim()) {
      const cleanName = name.trim();
      updateData.name = cleanName;

      // Auto-generate or update unique slug if name changed
      const baseSlug = slug && slug.trim()
        ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      const existingSlug = await prisma.category.findFirst({
        where: { slug: baseSlug, NOT: { id } },
      });
      updateData.slug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    } else if (slug && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const existingSlug = await prisma.category.findFirst({
        where: { slug: cleanSlug, NOT: { id } },
      });
      updateData.slug = existingSlug ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;
    }

    if (parentCategoryId !== undefined) {
      updateData.parentCategoryId = parentCategoryId || null;
    }
    if (image !== undefined) {
      updateData.image = image?.trim() || null;
    }
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    let updated;
    try {
      updated = await prisma.category.update({
        where: { id },
        data: updateData,
        include: {
          parentCategory: { select: { name: true } },
          subcategories: { select: { id: true } },
          _count: { select: { products: true } },
        },
      });
    } catch (updateError) {
      if (!isMissingColumnError(updateError)) throw updateError;
      delete updateData.image;
      delete updateData.isActive;
      updated = await prisma.category.update({
        where: { id },
        data: updateData,
        include: {
          parentCategory: { select: { name: true } },
          subcategories: { select: { id: true } },
          _count: { select: { products: true } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      category: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        image: "image" in updated ? updated.image || "" : "",
        isActive: "isActive" in updated ? updated.isActive : true,
        parentCategoryId: updated.parentCategoryId,
        parentCategoryName: updated.parentCategory?.name || null,
        subcategoriesCount: updated.subcategories.length,
        productsCount: updated._count.products,
      },
    });
  } catch (error) {
    console.error("Admin Category PATCH Error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to update category", details: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // Optional body parsing fallback
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Check if category has products assigned
    const prodCount = await prisma.product.count({ where: { categoryId: id } });
    if (prodCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category containing ${prodCount} active product(s). Please reassign or delete the products first.` },
        { status: 400 }
      );
    }

    // Unlink subcategories to prevent foreign key errors
    await prisma.category.updateMany({
      where: { parentCategoryId: id },
      data: { parentCategoryId: null },
    });

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Admin Category DELETE Error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to delete category", details: msg }, { status: 500 });
  }
}

function isMissingColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2022"
  );
}
