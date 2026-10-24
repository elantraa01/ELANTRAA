import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check if store settings have free gift promotion enabled
    const setting = await prisma.storeSetting.findUnique({
      where: { id: "default" },
      select: { isFreeGiftEnabled: true },
    });

    const isEnabled = setting ? setting.isFreeGiftEnabled : true;
    if (!isEnabled) {
      return NextResponse.json({ enabled: false, gift: null });
    }

    // Query active free gifts that have stock > 0
    const gifts = await prisma.freeGift.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        image: true,
        stock: true,
      },
    });

    if (gifts.length === 0) {
      return NextResponse.json({ enabled: true, gift: null });
    }

    // Pick a random gift from the available in-stock active gifts
    const randomIndex = Math.floor(Math.random() * gifts.length);
    const chosen = gifts[randomIndex];

    return NextResponse.json({
      enabled: true,
      gift: {
        id: chosen.id,
        name: chosen.name,
        image: chosen.image,
        price: 0,
      },
    });
  } catch (error) {
    console.error("GET /api/free-gift error:", error);
    return NextResponse.json({ enabled: false, gift: null }, { status: 500 });
  }
}
