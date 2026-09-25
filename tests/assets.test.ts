import assert from "node:assert/strict";
import test from "node:test";
import { LOGO_PNG_BASE64, FOUNDER_JPG_BASE64 } from "../lib/imageFallbacks";

function normalizeButtonLink(link?: string | null): string {
  if (!link) return "/shop";
  const trimmed = link.trim();
  if (
    trimmed === "" ||
    trimmed.toLowerCase() === "shop now" ||
    trimmed.toLowerCase() === "/shop now" ||
    trimmed.toLowerCase() === "shop"
  ) {
    return "/shop";
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return "/" + trimmed;
}

test("critical image fallbacks are valid non-empty base64 buffers", () => {
  assert.ok(LOGO_PNG_BASE64.length > 1000);
  assert.ok(FOUNDER_JPG_BASE64.length > 1000);

  const logoBuf = Buffer.from(LOGO_PNG_BASE64, "base64");
  const founderBuf = Buffer.from(FOUNDER_JPG_BASE64, "base64");

  assert.ok(logoBuf.length > 1000);
  assert.ok(founderBuf.length > 1000);
});

test("normalizeButtonLink handles 'Shop Now', spaces, and relative paths safely", () => {
  assert.equal(normalizeButtonLink("Shop Now"), "/shop");
  assert.equal(normalizeButtonLink("shop now"), "/shop");
  assert.equal(normalizeButtonLink("/Shop Now"), "/shop");
  assert.equal(normalizeButtonLink("shop"), "/shop");
  assert.equal(normalizeButtonLink(""), "/shop");
  assert.equal(normalizeButtonLink(undefined), "/shop");
  assert.equal(normalizeButtonLink(null), "/shop");
  assert.equal(normalizeButtonLink("/category/women"), "/category/women");
  assert.equal(normalizeButtonLink("category/women"), "/category/women");
  assert.equal(normalizeButtonLink("https://instagram.com/elantraaofficial"), "https://instagram.com/elantraaofficial");
});
