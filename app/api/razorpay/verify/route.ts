import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing Razorpay payment parameters for verification." },
        { status: 400 }
      );
    }

    const isValidSignature = verifyRazorpayPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      console.warn("Razorpay payment signature verification failed for order:", razorpay_order_id);
      return NextResponse.json(
        { error: "Invalid Razorpay payment signature.", verified: false },
        { status: 400 }
      );
    }

    // Update order status in Database if internal orderId or razorpay_order_id matches
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }).catch((dbErr) => {
        console.warn("Failed to update order by orderId in verify endpoint:", dbErr);
      });
    } else if (razorpay_order_id) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }).catch((dbErr) => {
        console.warn("Failed to update order by razorpayOrderId in verify endpoint:", dbErr);
      });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Razorpay payment verified and recorded successfully.",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Razorpay Verification API Error:", error);
    return NextResponse.json(
      { error: "Internal server error verifying Razorpay payment." },
      { status: 500 }
    );
  }
}
