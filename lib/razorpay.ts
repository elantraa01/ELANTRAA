import crypto from "crypto";
import Razorpay from "razorpay";

const PLACEHOLDER_RAZORPAY_KEY_ID = "rzp_test_elantraa_key_123";
const PLACEHOLDER_RAZORPAY_KEY_SECRET = "rzp_test_elantraa_secret_456";

export function getRazorpayKeys() {
  const configuredKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const configuredKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    process.env.NODE_ENV === "production" &&
    (!configuredKeyId ||
      !configuredKeySecret ||
      configuredKeyId === PLACEHOLDER_RAZORPAY_KEY_ID ||
      configuredKeySecret === PLACEHOLDER_RAZORPAY_KEY_SECRET)
  ) {
    throw new Error("Live Razorpay keys must be configured in production.");
  }

  const key_id = configuredKeyId || PLACEHOLDER_RAZORPAY_KEY_ID;
  const key_secret = configuredKeySecret || PLACEHOLDER_RAZORPAY_KEY_SECRET;

  return { key_id, key_secret };
}

export function getRazorpayInstance() {
  const { key_id, key_secret } = getRazorpayKeys();
  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Verify Razorpay payment signature (HMAC SHA-256)
 */
export function verifyRazorpayPaymentSignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  const { key_secret } = getRazorpayKeys();
  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  return generatedSignature === razorpay_signature;
}

/**
 * Verify Razorpay webhook signature (HMAC SHA-256)
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
}
