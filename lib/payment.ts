import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";

export type PaymentMethod = "COD" | "ONLINE" | "PARTIAL_COD";

type OrderPaymentInput = {
  paymentMethod?: unknown;
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
};

export type ValidatedOrderPayment = {
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "PAID" | "PARTIALLY_PAID";
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
};

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function validateOrderPayment(input: OrderPaymentInput): ValidatedOrderPayment {
  const paymentMethod = (input.paymentMethod || "COD") as PaymentMethod;

  if (paymentMethod !== "COD" && paymentMethod !== "ONLINE" && paymentMethod !== "PARTIAL_COD") {
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
    paymentStatus: paymentMethod === "PARTIAL_COD" ? "PARTIALLY_PAID" : "PAID",
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };
}
