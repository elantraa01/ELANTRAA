import { prisma } from "@/lib/prisma";

export type CouponDiscount = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
};

const fallbackCoupons: Record<string, { type: "percentage" | "fixed"; value: number; minSpend?: number }> = {
  ELANTRAAGOLD: { type: "percentage", value: 10 },
  WELCOME10: { type: "fixed", value: 500, minSpend: 2500 },
  FESTIVE15: { type: "percentage", value: 15, minSpend: 4000 },
  ELANTRAA10: { type: "fixed", value: 300 },
};

export async function getCouponDiscount(code: unknown, subtotal: number): Promise<CouponDiscount | null> {
  if (!code || typeof code !== "string") return null;

  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  const now = new Date();
  try {
    const couponModel = (prisma as unknown as Record<string, { findUnique?: (args: unknown) => Promise<Record<string, unknown> | null> }>).coupon;
    if (!couponModel || typeof couponModel.findUnique !== "function") {
      const fallback = fallbackCoupons[cleanCode];
      if (!fallback || (fallback.minSpend && subtotal < fallback.minSpend)) return null;
      return calculateDiscount(cleanCode, fallback.type, fallback.value, subtotal);
    }

    const coupon = await couponModel.findUnique({ where: { code: cleanCode } });
    if (!coupon || !coupon.isActive) return null;

    const startsAt = coupon.startsAt ? new Date(String(coupon.startsAt)) : null;
    const endsAt = coupon.endsAt ? new Date(String(coupon.endsAt)) : null;

    if (startsAt && startsAt > now) return null;
    if (endsAt && endsAt < now) return null;

    const discountType = coupon.type === "fixed" ? "fixed" : "percentage";
    const discountValue = Number(coupon.value);
    const minSpend = coupon.minSpend ? Number(coupon.minSpend) : 0;

    if (minSpend && subtotal < minSpend) return null;

    return calculateDiscount(cleanCode, discountType, discountValue, subtotal);
  } catch (error) {
    console.warn("Coupon discount calculation fallback warning:", error);

    const fallback = fallbackCoupons[cleanCode];
    if (!fallback || (fallback.minSpend && subtotal < fallback.minSpend)) return null;
    return calculateDiscount(cleanCode, fallback.type, fallback.value, subtotal);
  }
}

export async function getCouponValidation(
  code: unknown,
  subtotal: number
): Promise<{ discount: CouponDiscount | null; minSpend?: number }> {
  if (!code || typeof code !== "string") return { discount: null };

  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return { discount: null };

  try {
    const couponModel = (prisma as unknown as Record<string, { findUnique?: (args: unknown) => Promise<Record<string, unknown> | null> }>).coupon;
    if (!couponModel || typeof couponModel.findUnique !== "function") {
      const fallback = fallbackCoupons[cleanCode];
      if (!fallback) return { discount: null };
      if (fallback.minSpend && subtotal < fallback.minSpend) return { discount: null, minSpend: fallback.minSpend };
      return {
        discount: calculateDiscount(cleanCode, fallback.type, fallback.value, subtotal),
      };
    }

    const coupon = await couponModel.findUnique({ where: { code: cleanCode } });
    if (!coupon || !coupon.isActive) return { discount: null };

    const now = new Date();
    const startsAt = coupon.startsAt ? new Date(String(coupon.startsAt)) : null;
    const endsAt = coupon.endsAt ? new Date(String(coupon.endsAt)) : null;

    if (startsAt && startsAt > now) return { discount: null };
    if (endsAt && endsAt < now) return { discount: null };

    const minSpend = coupon.minSpend ? Number(coupon.minSpend) : 0;
    if (minSpend && subtotal < minSpend) return { discount: null, minSpend };

    const discountType = coupon.type === "fixed" ? "fixed" : "percentage";
    return {
      discount: calculateDiscount(cleanCode, discountType, Number(coupon.value), subtotal),
    };
  } catch (error) {
    console.warn("Coupon validation fallback warning:", error);

    const fallback = fallbackCoupons[cleanCode];
    if (!fallback) return { discount: null };
    if (fallback.minSpend && subtotal < fallback.minSpend) return { discount: null, minSpend: fallback.minSpend };
    return {
      discount: calculateDiscount(cleanCode, fallback.type, fallback.value, subtotal),
    };
  }
}

function calculateDiscount(
  code: string,
  discountType: "percentage" | "fixed",
  discountValue: number,
  subtotal: number
): CouponDiscount {
  const rawAmount = discountType === "percentage" ? (subtotal * discountValue) / 100 : discountValue;

  return {
    code,
    discountType,
    discountValue,
    discountAmount: Math.min(Math.round(rawAmount), subtotal),
  };
}
