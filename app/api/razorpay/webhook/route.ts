import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature, getRazorpayKeys } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const { key_secret } = getRazorpayKeys();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || key_secret;

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid Razorpay Webhook signature");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const { event: eventName, payload } = event;

    console.log(`Received Razorpay Webhook Event: ${eventName}`);

    if (eventName === "payment.captured" || eventName === "order.paid") {
      const paymentEntity = payload?.payment?.entity || payload?.order?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            razorpayPaymentId: razorpayPaymentId || undefined,
          },
        });
        console.log(`Updated Order paymentStatus to PAID for Razorpay Order ID: ${razorpayOrderId}`);
      }
    } else if (eventName === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId },
          data: {
            paymentStatus: "FAILED",
          },
        });
        console.log(`Updated Order paymentStatus to FAILED for Razorpay Order ID: ${razorpayOrderId}`);
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
