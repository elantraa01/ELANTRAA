import { NextRequest, NextResponse } from "next/server";

const VALID_COUPONS: Record<string, { type: "percentage" | "fixed"; value: number; minSpend?: number }> = {
  ELANTRAAGOLD: { type: "percentage", value: 10 },
  WELCOME10: { type: "fixed", value: 500, minSpend: 2500 },
  FESTIVE15: { type: "percentage", value: 15, minSpend: 4000 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please enter a promo code" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = VALID_COUPONS[cleanCode];

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 400 });
    }

    const currentSubtotal = Number(subtotal) || 0;

    if (coupon.minSpend && currentSubtotal < coupon.minSpend) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${coupon.minSpend.toLocaleString("en-IN")} required for code ${cleanCode}` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (currentSubtotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    return NextResponse.json({
      valid: true,
      code: cleanCode,
      discountType: coupon.type,
      discountValue: coupon.value,
      discountAmount: Math.round(discountAmount),
      message: `Promo code ${cleanCode} applied successfully!`,
    });
  } catch (error) {
    console.error("Coupon Validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
