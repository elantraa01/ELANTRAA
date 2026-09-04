import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCouponDiscount } from "@/lib/coupons";
import { getRazorpayInstance, getRazorpayKeys } from "@/lib/razorpay";

type IncomingOrderItem = {
  productId?: string;
  quantity?: number;
};

function getOrderQuantity(quantity: unknown) {
  const parsed = Number(quantity || 1);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 99) return null;
  return parsed;
}

async function calculateOrderBreakdown(items: IncomingOrderItem[], promoCode: unknown) {
  const quantitiesByProductId = new Map<string, number>();

  for (const item of items) {
    if (!item.productId) {
      throw new Error("Every order item must include a productId.");
    }

    const quantity = getOrderQuantity(item.quantity);
    if (!quantity) {
      throw new Error("Order item quantity must be between 1 and 99.");
    }

    quantitiesByProductId.set(
      item.productId,
      (quantitiesByProductId.get(item.productId) || 0) + quantity
    );
  }

  const productIds = Array.from(quantitiesByProductId.keys());
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    select: {
      id: true,
      price: true,
      discountPrice: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("One or more products are no longer available.");
  }

  const subtotal = products.reduce((sum, product) => {
    const quantity = quantitiesByProductId.get(product.id) || 0;
    return sum + Number(product.discountPrice ?? product.price) * quantity;
  }, 0);

  const settings = await prisma.storeSetting.findUnique({ where: { id: "default" } });
  const freeShippingThreshold = Number(settings?.freeShippingThreshold ?? 900);
  const shippingCharge = (subtotal >= freeShippingThreshold || subtotal === 0) ? 0 : Number(settings?.shippingCharge || 0);
  const couponDiscount = await getCouponDiscount(promoCode, subtotal);
  const promoDiscount = couponDiscount?.discountAmount || 0;

  const netProductAmount = Math.max(0, subtotal - promoDiscount);
  const totalAmount = Math.max(0, netProductAmount + shippingCharge);

  // 70% of product amount + 100% of shipping charge paid in advance online
  const advanceProductAmount = Math.ceil(netProductAmount * 0.7);
  const advancePayable = Math.max(0, advanceProductAmount + shippingCharge);
  const balancePayable = Math.max(0, totalAmount - advancePayable);

  return {
    subtotal,
    promoDiscount,
    shippingCharge,
    totalAmount,
    advancePayable,
    balancePayable,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, promoCode, currency = "INR", receipt, paymentMethod, isPartialCod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    const { key_id } = getRazorpayKeys();
    const instance = getRazorpayInstance();

    const breakdown = await calculateOrderBreakdown(items, promoCode);
    const isPartial = Boolean(isPartialCod || paymentMethod === "PARTIAL_COD");

    // If partial COD, customer pays 70% product value + shipping charge online
    const amountToCharge = isPartial ? breakdown.advancePayable : breakdown.totalAmount;
    const amountInPaise = Math.round(amountToCharge * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    let razorpayOrder;
    try {
      razorpayOrder = await instance.orders.create(orderOptions);
    } catch (rzpErr) {
      if (process.env.NODE_ENV === "production") {
        console.error("Razorpay API order creation failed:", rzpErr);
        return NextResponse.json({ error: "Unable to create payment order." }, { status: 502 });
      }

      console.warn("Razorpay API order creation warning, using development test order fallback:", rzpErr);
      razorpayOrder = {
        id: `order_rzp_test_${Date.now()}`,
        amount: amountInPaise,
        currency,
        receipt: orderOptions.receipt,
        status: "created",
      };
    }

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      key: key_id,
      breakdown: {
        ...breakdown,
        chargedAmount: amountToCharge,
        isPartialCod: isPartial,
      },
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
