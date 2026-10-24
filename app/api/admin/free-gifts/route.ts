import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const [gifts, setting] = await Promise.all([
      prisma.freeGift.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.storeSetting.findUnique({
        where: { id: "default" },
        select: { isFreeGiftEnabled: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      isFreeGiftEnabled: setting ? setting.isFreeGiftEnabled : true,
      gifts,
    });
  } catch (error) {
    console.error("GET /api/admin/free-gifts error:", error);
    return NextResponse.json({ error: "Failed to fetch free gifts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, image, stock, isActive } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Gift name is required." }, { status: 400 });
    }

    if (!image?.trim()) {
      return NextResponse.json({ error: "1 picture is required for the free gift." }, { status: 400 });
    }

    const parsedStock = parseInt(String(stock ?? 0), 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ error: "Stock must be a valid non-negative number." }, { status: 400 });
    }

    const gift = await prisma.freeGift.create({
      data: {
        name: name.trim(),
        image: image.trim(),
        stock: parsedStock,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, gift });
  } catch (error) {
    console.error("POST /api/admin/free-gifts error:", error);
    return NextResponse.json({ error: "Failed to create free gift" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();

    // Case 1: Toggle the master on/off switch for the Free Gift feature
    if (body.isFreeGiftEnabled !== undefined) {
      const isEnabled = Boolean(body.isFreeGiftEnabled);
      await prisma.storeSetting.upsert({
        where: { id: "default" },
        update: { isFreeGiftEnabled: isEnabled },
        create: {
          id: "default",
          isFreeGiftEnabled: isEnabled,
        },
      });

      return NextResponse.json({
        success: true,
        isFreeGiftEnabled: isEnabled,
        message: isEnabled ? "Free gift feature enabled" : "Free gift feature disabled",
      });
    }

    // Case 2: Update an individual free gift
    const { id, name, image, stock, isActive } = body;
    if (!id) {
      return NextResponse.json({ error: "Gift ID is required." }, { status: 400 });
    }

    const dataToUpdate: {
      name?: string;
      image?: string;
      stock?: number;
      isActive?: boolean;
    } = {};

    if (name !== undefined) dataToUpdate.name = String(name).trim();
    if (image !== undefined) dataToUpdate.image = String(image).trim();
    if (stock !== undefined) {
      const parsedStock = parseInt(String(stock), 10);
      if (!isNaN(parsedStock) && parsedStock >= 0) {
        dataToUpdate.stock = parsedStock;
      }
    }
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    const gift = await prisma.freeGift.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, gift });
  } catch (error) {
    console.error("PATCH /api/admin/free-gifts error:", error);
    return NextResponse.json({ error: "Failed to update free gift" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gift ID is required." }, { status: 400 });
    }

    await prisma.freeGift.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Free gift deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/free-gifts error:", error);
    return NextResponse.json({ error: "Failed to delete free gift" }, { status: 500 });
  }
}
