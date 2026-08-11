import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
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
        productInformation: true,
        deliveryTimelines: true,
        disclaimer: true,
        additionalInfo: true,
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
      sku: p.sku || "",
      description: p.description,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      category: p.category.name,
      categorySlug: p.category.slug,
      sizes: p.sizes,
      colors: p.colors,
      tags: Array.isArray(p.tags) ? p.tags : [],
      images: p.images,
      stock: p.stock,
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: p.isNewArrival !== false,
      isBestSeller: Boolean(p.isBestSeller),
      isActive: p.isActive,
      isReturnable: p.isReturnable !== false,
      productInformation: p.productInformation || "",
      deliveryTimelines: p.deliveryTimelines || "",
      disclaimer: p.disclaimer || "",
      additionalInfo: p.additionalInfo || "",
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    if (isMissingColumnError(error)) {
      try {
        const products = await prisma.product.findMany({
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
          sku: "",
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
          isActive: p.isActive,
          createdAt: p.createdAt.toISOString(),
        }));

        return NextResponse.json({
          products: formattedProducts,
          warning: "Admin migration is pending. SKU values will appear after running the database migration.",
        });
      } catch (fallbackError) {
        console.error("Admin Products fallback GET Error:", fallbackError);
      }
    }
    console.error("Admin Products GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      name,
      slug,
      description,
      price,
      discountPrice,
      sku,
      categoryId,
      categoryName,
      sizes = [],
      colors = [],
      tags = [],
      images = [],
      stock = 0,
      isFeatured = false,
      isNewArrival = false,
      isBestSeller = false,
      isActive = true,
      isReturnable = true,
      productInformation,
      deliveryTimelines,
      disclaimer,
      additionalInfo,
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: "Product name and price are required" }, { status: 400 });
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
      return NextResponse.json({ error: "A real category is required before creating a product." }, { status: 400 });
    }

    const createData = {
        name,
        slug: cleanSlug,
        description: description || "",
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        categoryId: cat.id,
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : [],
        tags: Array.isArray(tags) ? tags : [],
        images: Array.isArray(images) ? images : [],
        stock: Number(stock),
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller),
        isActive: Boolean(isActive),
        isReturnable: Boolean(isReturnable),
        productInformation: productInformation ? String(productInformation).trim() : null,
        deliveryTimelines: deliveryTimelines ? String(deliveryTimelines).trim() : null,
        disclaimer: disclaimer ? String(disclaimer).trim() : null,
        additionalInfo: additionalInfo ? String(additionalInfo).trim() : null,
      };

    const baseSelect = {
      id: true,
      name: true,
      slug: true,
      sku: true,
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
      productInformation: true,
      deliveryTimelines: true,
      disclaimer: true,
      additionalInfo: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
    };

    let newProduct;
    try {
      newProduct = await prisma.product.create({
        data: {
          ...createData,
          sku: sku?.trim() || null,
        },
        select: baseSelect,
      });
    } catch (createError) {
      console.warn("Admin Product POST primary create failed, attempting fallback:", createError);
      if (!isMissingColumnError(createError)) throw createError;
      const fallbackCreate = { ...createData };
      delete (fallbackCreate as Record<string, unknown>).productInformation;
      delete (fallbackCreate as Record<string, unknown>).deliveryTimelines;
      delete (fallbackCreate as Record<string, unknown>).disclaimer;
      delete (fallbackCreate as Record<string, unknown>).additionalInfo;
      delete (fallbackCreate as Record<string, unknown>).sku;
      delete (fallbackCreate as Record<string, unknown>).tags;
      delete (fallbackCreate as Record<string, unknown>).isNewArrival;
      delete (fallbackCreate as Record<string, unknown>).isBestSeller;

      const fallbackSelect = {
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
        category: { select: { name: true, slug: true } },
      };

      newProduct = await prisma.product.create({
        data: fallbackCreate,
        select: fallbackSelect,
      });
    }

    const formattedProduct = {
      id: newProduct.id,
      name: newProduct.name,
      slug: newProduct.slug,
      sku: (newProduct as { sku?: string }).sku || "",
      description: newProduct.description,
      price: Number(newProduct.price),
      discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : null,
      category: newProduct.category.name,
      categorySlug: newProduct.category.slug,
      sizes: newProduct.sizes,
      colors: newProduct.colors,
      tags: Array.isArray((newProduct as { tags?: string[] }).tags) ? (newProduct as { tags?: string[] }).tags : [],
      images: newProduct.images,
      stock: newProduct.stock,
      isFeatured: newProduct.isFeatured,
      isActive: newProduct.isActive,
      isReturnable: (newProduct as { isReturnable?: boolean }).isReturnable !== false,
      productInformation: (newProduct as { productInformation?: string | null }).productInformation || "",
      deliveryTimelines: (newProduct as { deliveryTimelines?: string | null }).deliveryTimelines || "",
      disclaimer: (newProduct as { disclaimer?: string | null }).disclaimer || "",
      additionalInfo: (newProduct as { additionalInfo?: string | null }).additionalInfo || "",
      createdAt: newProduct.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, product: formattedProduct });
  } catch (error) {
    console.error("Admin Product Create Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id, isFeatured, isNewArrival, isBestSeller, isActive, isReturnable, stock, name, price, discountPrice, images, description, sizes, colors, tags, categoryId, categoryName, sku, productInformation, deliveryTimelines, disclaimer, additionalInfo } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
    if (typeof isNewArrival === "boolean") updateData.isNewArrival = isNewArrival;
    if (typeof isBestSeller === "boolean") updateData.isBestSeller = isBestSeller;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (typeof isReturnable === "boolean") updateData.isReturnable = isReturnable;
    if (typeof stock === "number" || typeof stock === "string") updateData.stock = Number(stock);
    if (name) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku?.trim() || null;
    if (price !== undefined && price !== null) updateData.price = Number(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (Array.isArray(images) && images.length > 0) updateData.images = images;
    if (description) updateData.description = description;
    if (productInformation !== undefined) updateData.productInformation = productInformation ? String(productInformation).trim() : null;
    if (deliveryTimelines !== undefined) updateData.deliveryTimelines = deliveryTimelines ? String(deliveryTimelines).trim() : null;
    if (disclaimer !== undefined) updateData.disclaimer = disclaimer ? String(disclaimer).trim() : null;
    if (additionalInfo !== undefined) updateData.additionalInfo = additionalInfo ? String(additionalInfo).trim() : null;
    if (Array.isArray(sizes)) updateData.sizes = sizes;
    if (Array.isArray(colors)) updateData.colors = colors;
    if (Array.isArray(tags)) updateData.tags = tags;

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

    const baseSelect = {
      id: true,
      name: true,
      slug: true,
      sku: true,
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
      productInformation: true,
      deliveryTimelines: true,
      disclaimer: true,
      additionalInfo: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
    };

    let updated;
    try {
      updated = await prisma.product.update({
        where: { id },
        data: updateData,
        select: baseSelect,
      });
    } catch (updateError) {
      console.warn("Admin Product PATCH primary update failed, attempting fallback:", updateError);
      if (!isMissingColumnError(updateError)) {
        console.error("Admin Product PATCH error details:", updateError);
        return NextResponse.json({ error: "Failed to update product", details: String(updateError) }, { status: 500 });
      }
      const fallbackData = { ...updateData };
      delete fallbackData.productInformation;
      delete fallbackData.deliveryTimelines;
      delete fallbackData.disclaimer;
      delete fallbackData.additionalInfo;
      delete fallbackData.sku;
      delete fallbackData.tags;
      delete fallbackData.isNewArrival;
      delete fallbackData.isBestSeller;

      const fallbackSelect = {
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
        category: { select: { name: true, slug: true } },
      };

      updated = await prisma.product.update({
        where: { id },
        data: fallbackData,
        select: fallbackSelect,
      });
    }

    const formattedProduct = {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      sku: (updated as { sku?: string }).sku || "",
      description: updated.description,
      price: Number(updated.price),
      discountPrice: updated.discountPrice ? Number(updated.discountPrice) : null,
      category: updated.category.name,
      categorySlug: updated.category.slug,
      sizes: updated.sizes,
      colors: updated.colors,
      tags: Array.isArray((updated as { tags?: string[] }).tags) ? (updated as { tags?: string[] }).tags : [],
      images: updated.images,
      stock: updated.stock,
      isFeatured: updated.isFeatured,
      isActive: updated.isActive,
      isReturnable: (updated as { isReturnable?: boolean }).isReturnable !== false,
      productInformation: (updated as { productInformation?: string | null }).productInformation || "",
      deliveryTimelines: (updated as { deliveryTimelines?: string | null }).deliveryTimelines || "",
      disclaimer: (updated as { disclaimer?: string | null }).disclaimer || "",
      additionalInfo: (updated as { additionalInfo?: string | null }).additionalInfo || "",
      createdAt: updated.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, product: formattedProduct });
  } catch (error) {
    console.error("Admin Product PATCH Error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to update product", details: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

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

function isMissingColumnError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: string }).code;
  const message = String((error as { message?: string }).message || "");
  return (
    code === "P2022" ||
    message.includes("does not exist") ||
    message.includes("Unknown field") ||
    message.includes("column")
  );
}

