import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
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
      category: p.category.name,
      categorySlug: p.category.slug,
      sizes: p.sizes,
      colors: p.colors,
      images: p.images.length > 0 ? p.images : ["/images/collections/dresses.png"],
      stock: p.stock,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Admin Products GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;
    if (session && userRole !== "ADMIN") {
      // Return 403 if authenticated non-admin tries to modify
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      price,
      discountPrice,
      categoryId,
      categoryName = "Dresses",
      sizes = ["XS", "S", "M", "L", "XL"],
      colors = ["Champagne", "Ivory", "Gold"],
      images = ["/images/collections/dresses.png"],
      stock = 25,
      isFeatured = true,
      isActive = true,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const cleanSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    // Ensure category exists
    let cat = null;
    if (categoryId) {
      cat = await prisma.category.findUnique({ where: { id: categoryId } });
    }
    if (!cat && categoryName) {
      const targetSlug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      cat = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: categoryName, mode: "insensitive" } },
            { slug: targetSlug },
          ],
        },
      });

      if (!cat) {
        cat = await prisma.category.create({
          data: {
            name: categoryName,
            slug: targetSlug || "category",
          },
        });
      }
    }

    if (!cat) {
      cat = await prisma.category.findFirst();
    }

    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: categoryName || "Dresses",
          slug: (categoryName || "Dresses").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: cleanSlug,
        description: description || "Bespoke luxury silhouette.",
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        categoryId: cat.id,
        sizes,
        colors,
        images: Array.isArray(images) && images.length > 0 ? images : ["/images/collections/dresses.png"],
        stock: Number(stock),
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
      },
      include: {
        category: true,
      },
    });

    const formattedProduct = {
      id: newProduct.id,
      name: newProduct.name,
      slug: newProduct.slug,
      description: newProduct.description,
      price: Number(newProduct.price),
      discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : null,
      category: newProduct.category.name,
      categorySlug: newProduct.category.slug,
      sizes: newProduct.sizes,
      colors: newProduct.colors,
      images: newProduct.images.length > 0 ? newProduct.images : ["/images/collections/dresses.png"],
      stock: newProduct.stock,
      isFeatured: newProduct.isFeatured,
      isActive: newProduct.isActive,
      createdAt: newProduct.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, product: formattedProduct });
  } catch (error) {
    console.error("Admin Product Create Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isFeatured, isActive, stock, name, price, discountPrice, images, description, sizes, colors, categoryId, categoryName } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (typeof stock === "number" || typeof stock === "string") updateData.stock = Number(stock);
    if (name) updateData.name = name;
    if (price !== undefined && price !== null) updateData.price = Number(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (Array.isArray(images) && images.length > 0) updateData.images = images;
    if (description) updateData.description = description;
    if (Array.isArray(sizes)) updateData.sizes = sizes;
    if (Array.isArray(colors)) updateData.colors = colors;

    if (categoryId || categoryName) {
      let targetCat = null;
      if (categoryId) {
        targetCat = await prisma.category.findUnique({ where: { id: categoryId } });
      }
      if (!targetCat && categoryName) {
        const targetSlug = categoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        targetCat = await prisma.category.findFirst({
          where: {
            OR: [
              { name: { equals: categoryName, mode: "insensitive" } },
              { slug: targetSlug },
            ],
          },
        });

        if (!targetCat) {
          targetCat = await prisma.category.create({
            data: {
              name: categoryName,
              slug: targetSlug || "category",
            },
          });
        }
      }

      if (targetCat) {
        updateData.categoryId = targetCat.id;
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    const formattedProduct = {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      price: Number(updated.price),
      discountPrice: updated.discountPrice ? Number(updated.discountPrice) : null,
      category: updated.category.name,
      categorySlug: updated.category.slug,
      sizes: updated.sizes,
      colors: updated.colors,
      images: updated.images.length > 0 ? updated.images : ["/images/collections/dresses.png"],
      stock: updated.stock,
      isFeatured: updated.isFeatured,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, product: formattedProduct });
  } catch (error) {
    console.error("Admin Product PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Admin Product DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
