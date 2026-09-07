import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export interface PublicCoupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSpend: number | null;
  description: string;
}

export async function GET() {
  try {
    const couponModel = (
      prisma as unknown as Record<
        string,
        { findMany?: (args?: unknown) => Promise<Record<string, unknown>[]> }
      >
    ).coupon;

    if (!couponModel || typeof couponModel.findMany !== "function") {
      return NextResponse.json({ coupons: [] });
    }

    const now = new Date();
    const dbCoupons = await couponModel.findMany({
      where: {
        isActive: true,
      },
      orderBy: { value: "desc" },
    });

    if (!dbCoupons || dbCoupons.length === 0) {
      return NextResponse.json({ coupons: [] });
    }

    const validCoupons: PublicCoupon[] = dbCoupons
      .filter((c) => {
        if (!c.isActive) return false;
        const startsAt = c.startsAt ? new Date(String(c.startsAt)) : null;
        const endsAt = c.endsAt ? new Date(String(c.endsAt)) : null;
        if (startsAt && startsAt > now) return false;
        if (endsAt && endsAt < now) return false;
        return true;
      })
      .map((c) => {
        const type = String(c.type || "percentage").toLowerCase() === "fixed" ? "fixed" : "percentage";
        const value = Number(c.value) || 0;
        const minSpend = c.minSpend ? Number(c.minSpend) : null;
        const code = String(c.code || "").toUpperCase();

        let description = "";
        if (type === "percentage") {
          description = `Get ${value}% OFF${
            minSpend ? ` on orders above ₹${minSpend.toLocaleString("en-IN")}` : " on all orders"
          }`;
        } else {
          description = `Flat ₹${value.toLocaleString("en-IN")} OFF${
            minSpend ? ` on orders above ₹${minSpend.toLocaleString("en-IN")}` : ""
          }`;
        }

        return {
          id: String(c.id || code),
          code,
          type,
          value,
          minSpend,
          description,
        };
      });

    return NextResponse.json({ coupons: validCoupons });
  } catch (error) {
    console.warn("Public Coupons GET warning:", error);
    return NextResponse.json({ coupons: [] });
  }
}

