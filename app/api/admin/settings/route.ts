import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const defaultSettings = {
  id: "default",
  storeName: "ELANTRAA",
  storeLogo: "/images/logo/logo.png",
  contactEmail: "elantraa.01@gmail.com",
  currency: "INR",
  shippingCharge: 0,
  taxPercentage: 0,
};

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const settings = await prisma.storeSetting.upsert({
      where: { id: "default" },
      update: {},
      create: defaultSettings,
    });

    return NextResponse.json({
      settings: {
        ...settings,
        shippingCharge: Number(settings.shippingCharge),
        taxPercentage: Number(settings.taxPercentage),
      },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({
        settings: defaultSettings,
        warning: "Admin settings migration is pending. Settings will be saved after running the database migration.",
      });
    }
    console.error("Admin Settings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      storeName,
      storeLogo,
      contactEmail,
      currency,
      shippingCharge,
      taxPercentage,
    } = body;

    if (!storeName?.trim() || !contactEmail?.trim() || !currency?.trim()) {
      return NextResponse.json(
        { error: "Store name, contact email, and currency are required" },
        { status: 400 }
      );
    }

    const settings = await prisma.storeSetting.upsert({
      where: { id: "default" },
      update: {
        storeName: storeName.trim(),
        storeLogo: storeLogo?.trim() || "/images/logo/logo.png",
        contactEmail: contactEmail.trim(),
        currency: currency.trim().toUpperCase(),
        shippingCharge: Number(shippingCharge || 0),
        taxPercentage: Number(taxPercentage || 0),
      },
      create: {
        id: "default",
        storeName: storeName.trim(),
        storeLogo: storeLogo?.trim() || "/images/logo/logo.png",
        contactEmail: contactEmail.trim(),
        currency: currency.trim().toUpperCase(),
        shippingCharge: Number(shippingCharge || 0),
        taxPercentage: Number(taxPercentage || 0),
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        shippingCharge: Number(settings.shippingCharge),
        taxPercentage: Number(settings.taxPercentage),
      },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        { error: "Store settings table is not available yet. Run the admin database migration first." },
        { status: 503 }
      );
    }
    console.error("Admin Settings PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

function isMissingTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ["P2021", "P2022"].includes((error as { code?: string }).code || "")
  );
}
