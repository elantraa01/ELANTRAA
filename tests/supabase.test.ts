import assert from "node:assert/strict";
import test from "node:test";
import { getSupabaseConfig } from "../lib/supabase";

test("getSupabaseConfig derives URL from DATABASE_URL if SUPABASE_URL not set", () => {
  const prevSupabaseUrl = process.env.SUPABASE_URL;
  const prevNextPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prevDbUrl = process.env.DATABASE_URL;

  delete process.env.SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.DATABASE_URL = "postgresql://postgres.rcrukibwtmdmtbzbbbbo:secret@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

  const config = getSupabaseConfig();
  assert.equal(config.url, "https://rcrukibwtmdmtbzbbbbo.supabase.co");
  assert.equal(config.bucket, "products");

  // Restore
  if (prevSupabaseUrl) process.env.SUPABASE_URL = prevSupabaseUrl;
  if (prevNextPublicUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = prevNextPublicUrl;
  if (prevDbUrl) process.env.DATABASE_URL = prevDbUrl;
});

test("getSupabaseConfig uses explicit SUPABASE_URL when provided", () => {
  const prevSupabaseUrl = process.env.SUPABASE_URL;
  process.env.SUPABASE_URL = "https://custom-project.supabase.co";

  const config = getSupabaseConfig();
  assert.equal(config.url, "https://custom-project.supabase.co");

  if (prevSupabaseUrl) process.env.SUPABASE_URL = prevSupabaseUrl;
  else delete process.env.SUPABASE_URL;
});
