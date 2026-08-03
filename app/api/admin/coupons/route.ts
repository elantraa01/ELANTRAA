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

const defaultCoupons = [
  { code: "ELANTRAAGOLD", type: "percentage", value: 10, minSpend: null },
  { code: "WELCOME10", type: "fixed", value: 500, minSpend: 2500 },
  { code: "FESTIVE15", type: "percentage", value: 15, minSpend: 4000 },
  { code: "ELANTRAA10", type: "fixed", value: 300, minSpend: null },
];

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const couponModel = (prisma as unknown as Record<string, { findMany?: (args?: unknown) => Promise<unknown[]> }>).coupon;
    if (!couponModel || typeof couponModel.findMany !== "function") {
      return NextResponse.json({
        coupons: defaultCoupons.map((c) => ({
          id: c.code.toLowerCase(),
          code: c.code,
          type: c.type,
          value: c.value,
          minSpend: c.minSpend,
          isActive: true,
          startsAt: null,
          endsAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      });
    }

    await seedDefaultCoupons();
    const coupons = (await couponModel.findMany({ orderBy: { createdAt: "desc" } })) as Record<string, unknown>[];
    return NextResponse.json({ coupons: coupons.map(formatCoupon) });
  } catch (error) {
    console.warn("Admin Coupons GET warning:", error);
    return NextResponse.json({
      coupons: defaultCoupons.map((c) => ({
        id: c.code.toLowerCase(),
        code: c.code,
        type: c.type,
        value: c.value,
        minSpend: c.minSpend,
        isActive: true,
        startsAt: null,
        endsAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    });
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
      return NextResponse.json({
        coupon: {
          id: String(payload.code).toLowerCase(),
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
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
      return NextResponse.json({
        coupon: {
          id: body.id,
          ...payload,
          updatedAt: new Date().toISOString(),
        },
      });
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
    if (couponModel && typeof couponModel.delete === "function") {
      await couponModel.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Coupons DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}

async function seedDefaultCoupons() {
  const couponModel = (prisma as unknown as Record<string, { upsert?: (args: unknown) => Promise<unknown> }>).coupon;
  if (!couponModel || typeof couponModel.upsert !== "function") return;

  for (const coupon of defaultCoupons) {
    try {
      await couponModel.upsert({
        where: { code: coupon.code },
        update: {},
        create: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minSpend: coupon.minSpend,
          isActive: true,
        },
      });
    } catch (err) {
      console.warn("Coupon seed warning:", err);
    }
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
