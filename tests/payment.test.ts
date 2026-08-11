import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { getRazorpayKeys, verifyRazorpayPaymentSignature } from "../lib/razorpay";
import { validateOrderPayment } from "../lib/payment";

function signPayment(orderId: string, paymentId: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

test("validateOrderPayment keeps COD orders pending", () => {
  const result = validateOrderPayment({ paymentMethod: "COD" });

  assert.equal(result.paymentMethod, "COD");
  assert.equal(result.paymentStatus, "PENDING");
  assert.equal(result.razorpayOrderId, null);
});

test("validateOrderPayment rejects online payments without full verification details", () => {
  assert.throws(
    () => validateOrderPayment({ paymentMethod: "ONLINE" }),
    /Razorpay payment verification details are required/
  );
});

test("validateOrderPayment rejects invalid online payment signatures", () => {
  process.env.RAZORPAY_KEY_SECRET = "test_secret";

  assert.throws(
    () =>
      validateOrderPayment({
        paymentMethod: "ONLINE",
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "bad_signature",
      }),
    /Invalid Razorpay payment signature/
  );
});

test("validateOrderPayment accepts valid online payment signatures", () => {
  process.env.RAZORPAY_KEY_SECRET = "test_secret";

  const result = validateOrderPayment({
    paymentMethod: "ONLINE",
    razorpay_order_id: "order_123",
    razorpay_payment_id: "pay_123",
    razorpay_signature: signPayment("order_123", "pay_123", "test_secret"),
  });

  assert.equal(result.paymentMethod, "ONLINE");
  assert.equal(result.paymentStatus, "PAID");
  assert.equal(result.razorpayOrderId, "order_123");
  assert.equal(result.razorpayPaymentId, "pay_123");
});

test("verifyRazorpayPaymentSignature validates HMAC signatures", () => {
  process.env.RAZORPAY_KEY_SECRET = "another_secret";

  assert.equal(
    verifyRazorpayPaymentSignature({
      razorpay_order_id: "order_456",
      razorpay_payment_id: "pay_456",
      razorpay_signature: signPayment("order_456", "pay_456", "another_secret"),
    }),
    true
  );
});

test("getRazorpayKeys rejects placeholder keys in production", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousKeyId = process.env.RAZORPAY_KEY_ID;
  const previousPublicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const previousKeySecret = process.env.RAZORPAY_KEY_SECRET;

  process.env.NODE_ENV = "production";
  process.env.RAZORPAY_KEY_ID = "rzp_test_elantraa_key_123";
  delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  process.env.RAZORPAY_KEY_SECRET = "rzp_test_elantraa_secret_456";

  assert.throws(() => getRazorpayKeys(), /Live Razorpay keys must be configured/);

  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;

  if (previousKeyId === undefined) delete process.env.RAZORPAY_KEY_ID;
  else process.env.RAZORPAY_KEY_ID = previousKeyId;

  if (previousPublicKeyId === undefined) delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  else process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = previousPublicKeyId;

  if (previousKeySecret === undefined) delete process.env.RAZORPAY_KEY_SECRET;
  else process.env.RAZORPAY_KEY_SECRET = previousKeySecret;
});
