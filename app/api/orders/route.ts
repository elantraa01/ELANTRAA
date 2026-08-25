import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendWhatsAppOrderNotification } from "@/lib/whatsapp";
import { getCouponDiscount } from "@/lib/coupons";
import { validateOrderPayment } from "@/lib/payment";

type IncomingOrderItem = {
  productId?: string;
  size?: string;
  color?: string;
  quantity?: number;
};

type PricedOrderItem = {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
};

function getOrderQuantity(quantity: unknown) {
  const parsed = Number(quantity || 1);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 99) return null;
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string })?.id;
    const sessionEmail = session?.user?.email;

    const body = await req.json();
    const {
      userId,
      userEmail,
      shippingAddress,
      items,
      promoCode,
      paymentMethod = "COD",
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    const targetEmail = sessionEmail || userEmail || shippingAddress?.email;

    if (!sessionUserId && !sessionEmail && !targetEmail) {
      return NextResponse.json({ error: "Please log in or provide an email before placing an order." }, { status: 401 });
    }

    if (!shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Shipping address and items are required" },
        { status: 400 }
      );
    }

    let payment;
    try {
      payment = validateOrderPayment({
        paymentMethod,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
    } catch (paymentError) {
      const message = paymentError instanceof Error ? paymentError.message : "Invalid payment details.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Robust user lookup: check by userId, userEmail, or shippingAddress.email
    let orderUserId = sessionUserId || userId;

    try {
      let user = null;
      if (orderUserId && !orderUserId.startsWith("guest_")) {
        user = await prisma.user.findUnique({ where: { id: orderUserId } });
      }

      if (!user && targetEmail) {
        user = await prisma.user.findUnique({ where: { email: targetEmail.toLowerCase().trim() } });
      }

      if (!user && targetEmail) {
        const customerName = shippingAddress?.fullName || targetEmail.split("@")[0] || "Valued Client";
        user = await prisma.user.create({
          data: {
            email: targetEmail.toLowerCase().trim(),
            name: customerName,
            role: "CUSTOMER",
          },
        });
      }

      if (user) {
        orderUserId = user.id;

        // Auto-save shipping address to user's Saved Addresses in database
        if (shippingAddress?.line1 && shippingAddress?.city && shippingAddress?.pincode) {
          const existingAddr = await prisma.address.findFirst({
            where: {
              userId: user.id,
              line1: shippingAddress.line1,
              pincode: shippingAddress.pincode,
            },
          });

          if (!existingAddr) {
            const userAddressCount = await prisma.address.count({ where: { userId: user.id } });
            await prisma.address.create({
              data: {
                userId: user.id,
                line1: shippingAddress.line1,
                line2: shippingAddress.line2 || null,
                city: shippingAddress.city,
                state: shippingAddress.state || "",
                pincode: shippingAddress.pincode,
                country: shippingAddress.country || "India",
                isDefault: userAddressCount === 0,
              },
            });
          }
        }
      }
    } catch (userErr) {
      console.warn("User lookup / address creation warning in order API:", userErr);
    }

    if (!orderUserId) {
      return NextResponse.json(
        { error: "A customer email is required to place an order." },
        { status: 400 }
      );
    }

    const normalizedItems = new Map<string, IncomingOrderItem & { quantity: number }>();
    for (const item of items as IncomingOrderItem[]) {
      if (!item.productId) {
        return NextResponse.json({ error: "Every order item must include a productId." }, { status: 400 });
      }

      const quantity = getOrderQuantity(item.quantity);
      if (!quantity) {
        return NextResponse.json({ error: "Order item quantity must be between 1 and 99." }, { status: 400 });
      }

      const size = item.size || "M";
      const color = item.color || "Default";
      const key = `${item.productId}:${size}:${color}`;
      const existing = normalizedItems.get(key);

      normalizedItems.set(key, {
        productId: item.productId,
        size,
        color,
        quantity: (existing?.quantity || 0) + quantity,
      });
    }

    const orderLines = Array.from(normalizedItems.values());
    const productIds = Array.from(new Set(orderLines.map((item) => item.productId!)));

    const orderSummary = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          discountPrice: true,
          stock: true,
        },
      });

      const productsById = new Map(products.map((product) => [product.id, product]));
      const pricedItems: PricedOrderItem[] = [];

      for (const item of orderLines) {
        const product = productsById.get(item.productId!);
        if (!product) {
          throw new Error("One or more products are no longer available.");
        }

        if (product.stock < item.quantity) {
          throw new Error(`${product.name} has only ${product.stock} item(s) left in stock.`);
        }

        pricedItems.push({
          productId: product.id,
          name: product.name,
          size: item.size || "M",
          color: item.color || "Default",
          quantity: item.quantity,
          price: Number(product.discountPrice ?? product.price),
        });
      }

      const subtotal = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const settings = await tx.storeSetting.findUnique({ where: { id: "default" } });
      const freeShippingThreshold = Number(settings?.freeShippingThreshold ?? 900);
      const shippingCharge = (subtotal >= freeShippingThreshold || subtotal === 0) ? 0 : Number(settings?.shippingCharge || 0);
      const couponDiscount = await getCouponDiscount(promoCode, subtotal);
      const promoDiscount = couponDiscount?.discountAmount || 0;
      const netProductAmount = Math.max(0, subtotal - promoDiscount);
      const recalculatedTotal = Math.max(0, netProductAmount + shippingCharge);

      // Compute advance and balance amounts according to payment method
      let advanceAmount = 0;
      let balanceAmount = recalculatedTotal;

      if (payment.paymentMethod === "ONLINE") {
        advanceAmount = recalculatedTotal;
        balanceAmount = 0;
      } else if (payment.paymentMethod === "PARTIAL_COD") {
        // 50% product value + 100% shipping charge paid online as advance
        advanceAmount = Math.min(recalculatedTotal, Math.ceil(netProductAmount * 0.5) + shippingCharge);
        balanceAmount = Math.max(0, recalculatedTotal - advanceAmount);
      }

      for (const item of pricedItems) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new Error(`${item.name} is no longer available in the requested quantity.`);
        }
      }

      const dbOrder = await tx.order.create({
        data: {
          userId: orderUserId,
          totalAmount: recalculatedTotal,
          advanceAmount,
          balanceAmount,
          paymentMethod: payment.paymentMethod,
          status: "CONFIRMED",
          paymentStatus: payment.paymentStatus,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpaySignature: payment.razorpaySignature,
          shippingAddress: {
            ...shippingAddress,
            pricing: {
              subtotal,
              promoCode: couponDiscount?.code || null,
              promoDiscount,
              shippingCharge,
              advanceAmount,
              balanceAmount,
              paymentMethod: payment.paymentMethod,
            },
          },
          items: {
            create: pricedItems.map((item) => ({
              productId: item.productId,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      return {
        orderId: dbOrder.id,
        totalAmount: recalculatedTotal,
        advanceAmount,
        balanceAmount,
        paymentMethod: payment.paymentMethod,
        items: pricedItems,
      };
    });

    // 3. Send Order Confirmation Email using Nodemailer/Resend (safely in background)
    try {
      await sendOrderConfirmationEmail({
        orderId: orderSummary.orderId,
        customerName: shippingAddress.fullName || "Valued Client",
        customerEmail: shippingAddress.email || userEmail || targetEmail,
        totalAmount: orderSummary.totalAmount,
        paymentMethod: payment.paymentMethod,
        items: orderSummary.items.map((item) => ({
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country,
        },
      });
    } catch (emailErr) {
      console.warn("Order confirmation email sending error:", emailErr);
    }

    // 4. Send Automated WhatsApp Order Notification via Meta Cloud API
    const customerPhone = shippingAddress.phone || shippingAddress.phoneNumber || shippingAddress.mobile;
    if (customerPhone) {
      await sendWhatsAppOrderNotification({
        phone: customerPhone,
        customerName: shippingAddress.fullName || "Valued Client",
        orderId: orderSummary.orderId,
        totalAmount: orderSummary.totalAmount,
        paymentMethod: payment.paymentMethod,
        itemsCount: orderSummary.items.length,
      }).catch((wsErr) => {
        console.error("WhatsApp notification background error:", wsErr);
      });
    }

    return NextResponse.json({
      success: true,
      orderId: orderSummary.orderId,
      totalAmount: orderSummary.totalAmount,
      message: "Order placed, stock decremented, and confirmation email sent successfully.",
    });
  } catch (error) {
    console.error("Order POST Processing Error:", error);
    const message = error instanceof Error ? error.message : "Failed to process order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
