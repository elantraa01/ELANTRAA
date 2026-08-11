import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

type CouponPayload = {
  id?: string;
  code?: string;
  type?: string;
  value?: number | string;
  minSpend?: number | string | null;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const couponModel = (prisma as unknown as Record<string, { findMany?: (args?: unknown) => Promise<unknown[]> }>).coupon;
    if (!couponModel || typeof couponModel.findMany !== "function") {
      return NextResponse.json({ coupons: [] });
    }

    const coupons = (await couponModel.findMany({ orderBy: { createdAt: "desc" } })) as Record<string, unknown>[];
    return NextResponse.json({ coupons: coupons.map(formatCoupon) });
  } catch (error) {
    console.warn("Admin Coupons GET warning:", error);
    return NextResponse.json({ coupons: [] });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const payload = normalizeCouponPayload(await req.json());
    if ("error" in payload) return NextResponse.json({ error: payload.error }, { status: 400 });

    const couponModel = (prisma as unknown as Record<string, { create?: (args: unknown) => Promise<unknown> }>).coupon;
    if (!couponModel || typeof couponModel.create !== "function") {
      return NextResponse.json({ error: "Coupon table is not available. Run the database migration first." }, { status: 501 });
    }

    const coupon = await couponModel.create({ data: payload });
    return NextResponse.json({ coupon: formatCoupon(coupon as Record<string, unknown>) });
  } catch (error) {
    console.error("Admin Coupons POST Error:", error);
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = (await req.json()) as CouponPayload;
    if (!body.id) return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });

    const payload = normalizeCouponPayload(body);
    if ("error" in payload) return NextResponse.json({ error: payload.error }, { status: 400 });

    const couponModel = (prisma as unknown as Record<string, { update?: (args: unknown) => Promise<unknown> }>).coupon;
    if (!couponModel || typeof couponModel.update !== "function") {
      return NextResponse.json({ error: "Coupon table is not available. Run the database migration first." }, { status: 501 });
    }

    const coupon = await couponModel.update({
      where: { id: body.id },
      data: payload,
    });

    return NextResponse.json({ coupon: formatCoupon(coupon as Record<string, unknown>) });
  } catch (error) {
    console.error("Admin Coupons PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });

    const couponModel = (prisma as unknown as Record<string, { delete?: (args: unknown) => Promise<unknown> }>).coupon;
    if (!couponModel || typeof couponModel.delete !== "function") {
      return NextResponse.json({ error: "Coupon table is not available. Run the database migration first." }, { status: 501 });
    }

    await couponModel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Coupons DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}

function normalizeCouponPayload(body: CouponPayload) {
  const code = body.code?.trim().toUpperCase();
  const type = body.type === "fixed" ? "fixed" : body.type === "percentage" ? "percentage" : "";
  const value = Number(body.value);
  const minSpend = body.minSpend === "" || body.minSpend === null || body.minSpend === undefined ? null : Number(body.minSpend);

  if (!code) return { error: "Promo code is required" };
  if (!type) return { error: "Discount type must be fixed or percentage" };
  if (!Number.isFinite(value) || value <= 0) return { error: "Discount value must be greater than zero" };
  if (type === "percentage" && value > 100) return { error: "Percentage discount cannot exceed 100" };
  if (minSpend !== null && (!Number.isFinite(minSpend) || minSpend < 0)) return { error: "Minimum spend must be zero or higher" };

  return {
    code,
    type,
    value,
    minSpend,
    isActive: body.isActive !== false,
    startsAt: body.startsAt ? new Date(body.startsAt) : null,
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
  };
}

function formatCoupon(coupon: Record<string, unknown>) {
  const startsAt = coupon.startsAt instanceof Date ? coupon.startsAt : coupon.startsAt ? new Date(String(coupon.startsAt)) : null;
  const endsAt = coupon.endsAt instanceof Date ? coupon.endsAt : coupon.endsAt ? new Date(String(coupon.endsAt)) : null;
  const createdAt = coupon.createdAt instanceof Date ? coupon.createdAt : coupon.createdAt ? new Date(String(coupon.createdAt)) : new Date();
  const updatedAt = coupon.updatedAt instanceof Date ? coupon.updatedAt : coupon.updatedAt ? new Date(String(coupon.updatedAt)) : new Date();

  return {
    id: String(coupon.id || coupon.code),
    code: String(coupon.code),
    type: coupon.type === "fixed" ? "fixed" : "percentage",
    value: Number(coupon.value),
    minSpend: coupon.minSpend === null || coupon.minSpend === undefined ? null : Number(coupon.minSpend),
    isActive: Boolean(coupon.isActive),
    startsAt: startsAt?.toISOString() || null,
    endsAt: endsAt?.toISOString() || null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}
