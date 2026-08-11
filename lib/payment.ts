import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";

export type PaymentMethod = "COD" | "ONLINE";

type OrderPaymentInput = {
  paymentMethod?: unknown;
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
};

export type ValidatedOrderPayment = {
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "PAID";
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
};

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function validateOrderPayment(input: OrderPaymentInput): ValidatedOrderPayment {
  const paymentMethod = input.paymentMethod || "COD";

  if (paymentMethod !== "COD" && paymentMethod !== "ONLINE") {
    throw new Error("Unsupported payment method.");
  }

  if (paymentMethod === "COD") {
    return {
      paymentMethod,
      paymentStatus: "PENDING",
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySignature: null,
    };
  }

  const razorpayOrderId = asNonEmptyString(input.razorpay_order_id);
  const razorpayPaymentId = asNonEmptyString(input.razorpay_payment_id);
  const razorpaySignature = asNonEmptyString(input.razorpay_signature);

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new Error("Razorpay payment verification details are required.");
  }

  const isValid = verifyRazorpayPaymentSignature({
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  });

  if (!isValid) {
    throw new Error("Invalid Razorpay payment signature.");
  }

  return {
    paymentMethod,
    paymentStatus: "PAID",
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };
}
