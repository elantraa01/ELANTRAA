import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.storeSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return NextResponse.json({
        settings: {
          storeName: "ELANTRAA",
          shippingCharge: 0,
          taxPercentage: 0,
          currency: "INR",
        },
      });
    }

    return NextResponse.json({
      settings: {
        storeName: settings.storeName,
        storeLogo: settings.storeLogo,
        contactEmail: settings.contactEmail,
        currency: settings.currency,
        shippingCharge: Number(settings.shippingCharge),
        taxPercentage: Number(settings.taxPercentage),
      },
    });
  } catch (error) {
    console.error("Public Settings GET Error:", error);
    return NextResponse.json({
      settings: {
        storeName: "ELANTRAA",
        shippingCharge: 0,
        taxPercentage: 0,
        currency: "INR",
      },
    });
  }
}
