import { createClient, SupabaseClient } from "@supabase/supabase-js";

function isPlaceholderUrl(url?: string | null): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  return (
    trimmed === "" ||
    trimmed.startsWith("your_") ||
    trimmed.startsWith("mock_") ||
    trimmed.includes("placeholder")
  );
}

function isValidJwtKey(key?: string | null): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === "" ||
    trimmed.startsWith("your_") ||
    trimmed.startsWith("mock_") ||
    trimmed.includes("placeholder") ||
    trimmed.includes("ChangeMe")
  ) {
    return false;
  }
  // Real Supabase anon/service_role keys are JWTs (3 segments separated by dots, starting with eyJ)
  const segments = trimmed.split(".");
  return segments.length === 3 && trimmed.startsWith("eyJ");
}

function deriveSupabaseUrl(): string {
  if (process.env.SUPABASE_URL && !isPlaceholderUrl(process.env.SUPABASE_URL)) {
    return process.env.SUPABASE_URL.trim();
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !isPlaceholderUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL.trim();
  }

  // Auto-derive project URL if DATABASE_URL is a Supabase connection string
  const dbUrl = process.env.DATABASE_URL || "";
  const match = dbUrl.match(/postgres(?:ql)?:\/\/(?:postgres\.)?([a-zA-Z0-9_-]+):/);
  if (match && match[1]) {
    return `https://${match[1]}.supabase.co`;
  }
  const poolerMatch = dbUrl.match(/@(?:aws-[0-9]-[a-z0-9-]+\.pooler\.)?supabase\.com/);
  if (poolerMatch) {
    const refMatch = dbUrl.match(/postgres\.([a-zA-Z0-9_-]+):/);
    if (refMatch && refMatch[1]) {
      return `https://${refMatch[1]}.supabase.co`;
    }
  }

  return "https://rcrukibwtmdmtbzbbbbo.supabase.co";
}

export function getSupabaseConfig() {
  const url = deriveSupabaseUrl();
  const rawKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    null;

  const isConfigured = isValidJwtKey(rawKey);

  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
    "products";

  return {
    url,
    key: rawKey ? rawKey.trim() : null,
    isConfigured,
    bucket: bucket.trim(),
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedKey: string | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!url || !key || !isConfigured) return null;

  if (cachedClient && cachedKey === `${url}:${key}`) {
    return cachedClient;
  }

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  cachedKey = `${url}:${key}`;

  return cachedClient;
}

export async function uploadToSupabaseStorage(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  folder = "products"
): Promise<{ url: string; fileName: string }> {
  const { url, key, bucket, isConfigured } = getSupabaseConfig();

  if (!isConfigured || !key) {
    throw new Error(
      "Supabase API key is not configured or is still using a placeholder. Please copy your service_role (or anon) key from Supabase Dashboard > Project Settings > API and paste it into SUPABASE_SERVICE_ROLE_KEY in your .env.local file (the key starts with 'eyJ...')."
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase || !url) {
    throw new Error(
      "Failed to initialize Supabase client. Please verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  const cleanName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const filePath = folder ? `${folder}/${Date.now()}-${cleanName}` : `${Date.now()}-${cleanName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType,
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    const errorMsg = error.message || "";

    if (errorMsg.includes("Invalid Compact JWS") || errorMsg.toLowerCase().includes("jwt")) {
      throw new Error(
        "Invalid Supabase API Key (Invalid Compact JWS). Please check SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. Copy the entire key (starting with 'eyJ...') from Supabase Dashboard > Project Settings > API."
      );
    }

    // If bucket not found error, try to create it or provide clear guidance
    if (errorMsg.toLowerCase().includes("bucket not found")) {
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
      });

      if (!createError) {
        // Retry upload once after creating bucket
        const retry = await supabase.storage.from(bucket).upload(filePath, fileBuffer, {
          contentType,
          cacheControl: "3600",
          upsert: true,
        });

        if (!retry.error) {
          const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
          return { url: publicData.publicUrl, fileName: filePath };
        }
      }

      throw new Error(
        `Supabase Storage bucket "${bucket}" not found. Please create a public bucket named "${bucket}" in your Supabase dashboard (Storage > New bucket > check "Public bucket").`
      );
    }

    throw new Error(`Supabase Storage upload error: ${errorMsg}`);
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (!publicData || !publicData.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase Storage.");
  }

  return {
    url: publicData.publicUrl,
    fileName: data?.path || filePath,
  };
}
