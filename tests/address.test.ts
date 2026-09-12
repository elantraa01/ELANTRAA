import assert from "node:assert/strict";
import test from "node:test";
import { formatAddress, parseAddressDetails } from "../lib/address";

test("formatAddress excludes internal pricing object and never produces [object Object]", () => {
  const addressWithPricing = {
    fullName: "Mohit Kumar",
    phone: "9876543210",
    line1: "House 123, Sector 62",
    line2: "Near Metro Station",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301",
    country: "India",
    pricing: {
      subtotal: 5000,
      promoCode: "SUMMER",
      promoDiscount: 500,
      shippingCharge: 0,
      advanceAmount: 5000,
      balanceAmount: 0,
    },
  };

  const formatted = formatAddress(addressWithPricing);

  assert.ok(!formatted.includes("[object Object]"), "Formatted address must never contain [object Object]");
  assert.ok(formatted.includes("Mohit Kumar"));
  assert.ok(formatted.includes("Ph: 9876543210"));
  assert.ok(formatted.includes("House 123, Sector 62"));
  assert.ok(formatted.includes("Noida"));
  assert.ok(!formatted.includes("5000"));
});

test("parseAddressDetails handles missing phone gracefully", () => {
  const raw = {
    fullName: "Mohit Kumar",
    line1: "Noida",
    city: "Noida",
    state: "HP",
    pincode: "173775",
    pricing: { subtotal: 1000 },
  };

  const parsed = parseAddressDetails(raw);
  assert.ok(parsed);
  assert.equal(parsed.recipientName, "Mohit Kumar");
  assert.equal(parsed.phone, "");
  assert.equal(parsed.line1, "Noida");
  assert.equal(parsed.city, "Noida");
  assert.equal(parsed.pincode, "173775");
});

test("parseAddressDetails safely extracts phone from mobile or contact alias", () => {
  const parsed1 = parseAddressDetails({ mobile: "9998887776", line1: "Test" });
  assert.equal(parsed1?.phone, "9998887776");

  const parsed2 = parseAddressDetails({ contact: "+91 9998887776", line1: "Test" });
  assert.equal(parsed2?.phone, "+91 9998887776");
});

test("formatAddress handles null and undefined safely", () => {
  assert.equal(formatAddress(null), "No shipping address provided.");
  assert.equal(formatAddress(undefined), "No shipping address provided.");
});
