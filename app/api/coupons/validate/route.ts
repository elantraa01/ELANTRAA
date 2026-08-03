import { NextRequest, NextResponse } from "next/server";
import { getCouponValidation } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please enter a promo code" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const currentSubtotal = Number(subtotal) || 0;
    const { discount, minSpend } = await getCouponValidation(cleanCode, currentSubtotal);

    if (!discount && !minSpend) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 400 });
    }

    if (!discount && minSpend) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${minSpend.toLocaleString("en-IN")} required for code ${cleanCode}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: discount!.code,
      discountType: discount!.discountType,
      discountValue: discount!.discountValue,
      discountAmount: discount!.discountAmount,
      message: `Promo code ${cleanCode} applied successfully!`,
    });
  } catch (error) {
    console.error("Coupon Validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
