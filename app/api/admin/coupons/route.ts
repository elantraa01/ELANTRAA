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
    await seedDefaultCoupons();
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons: coupons.map(formatCoupon) });
  } catch (error) {
    if (isMissingCouponTableError(error)) {
      return NextResponse.json({
        coupons: defaultCoupons.map((coupon) =>
          formatCoupon({
            id: coupon.code.toLowerCase(),
            ...coupon,
            isActive: true,
            startsAt: null,
            endsAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        ),
        warning: "Coupon migration is pending. Run the database migration before saving promo codes.",
      });
    }

    console.error("Admin Coupons GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const payload = normalizeCouponPayload(await req.json());
    if ("error" in payload) return NextResponse.json({ error: payload.error }, { status: 400 });

    const coupon = await prisma.coupon.create({ data: payload });
    return NextResponse.json({ coupon: formatCoupon(coupon) });
  } catch (error) {
    if (isMissingCouponTableError(error)) {
      return NextResponse.json({ error: "Coupon table is not available yet. Run the latest database migration." }, { status: 503 });
    }
    if (isUniqueError(error)) {
      return NextResponse.json({ error: "This promo code already exists." }, { status: 409 });
    }

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

    const coupon = await prisma.coupon.update({
      where: { id: body.id },
      data: payload,
    });

    return NextResponse.json({ coupon: formatCoupon(coupon) });
  } catch (error) {
    if (isMissingCouponTableError(error)) {
      return NextResponse.json({ error: "Coupon table is not available yet. Run the latest database migration." }, { status: 503 });
    }
    if (isUniqueError(error)) {
      return NextResponse.json({ error: "This promo code already exists." }, { status: 409 });
    }

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

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isMissingCouponTableError(error)) {
      return NextResponse.json({ error: "Coupon table is not available yet. Run the latest database migration." }, { status: 503 });
    }

    console.error("Admin Coupons DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}

async function seedDefaultCoupons() {
  for (const coupon of defaultCoupons) {
    await prisma.coupon.upsert({
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

function formatCoupon(coupon: {
  id: string;
  code: string;
  type: string;
  value: unknown;
  minSpend: unknown | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type === "fixed" ? "fixed" : "percentage",
    value: Number(coupon.value),
    minSpend: coupon.minSpend === null ? null : Number(coupon.minSpend),
    isActive: coupon.isActive,
    startsAt: coupon.startsAt?.toISOString() || null,
    endsAt: coupon.endsAt?.toISOString() || null,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };
}

function isMissingCouponTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ["P2021", "P2022"].includes((error as { code?: string }).code || "")
  );
}

function isUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
