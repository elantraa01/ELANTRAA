const PLACEHOLDER_VALUES = new Set([
  "elantraa_luxury_haute_couture_secret_key_2026",
  "development-only-nextauth-secret-do-not-use-in-production",
  "your-strong-admin-password",
  "rzp_test_elantraa_key_123",
  "rzp_test_elantraa_secret_456",
  "rzp_test_elantraa_webhook_secret_789",
  "test_user",
  "test_pass",
  "mock_smtp_password",
]);

function valueOf(name: string) {
  return process.env[name]?.trim() || "";
}

function isUnsafeValue(value: string) {
  const lowered = value.toLowerCase();

  return (
    !value ||
    PLACEHOLDER_VALUES.has(value) ||
    lowered.startsWith("your_") ||
    lowered.startsWith("mock_") ||
    lowered.includes("placeholder") ||
    lowered.includes("changeme")
  );
}

function requireCleanEnv(name: string, issues: string[]) {
  const value = valueOf(name);

  if (isUnsafeValue(value)) {
    issues.push(`${name} is missing or still uses a placeholder/test value.`);
  }

  return value;
}

function requireHttpsUrl(name: string, issues: string[]) {
  const value = requireCleanEnv(name, issues);

  if (!value) return value;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      issues.push(`${name} must be a public HTTPS URL.`);
    }
  } catch {
    issues.push(`${name} must be a valid URL.`);
  }

  return value;
}

function cleanBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function requireLiveRazorpayKey(name: string, issues: string[]) {
  const value = requireCleanEnv(name, issues);

  if (value && !value.startsWith("rzp_live_")) {
    issues.push(`${name} must be a live Razorpay key that starts with rzp_live_.`);
  }

  return value;
}

function requireSupabaseJwt(name: string, issues: string[]) {
  const value = requireCleanEnv(name, issues);
  const segments = value.split(".");

  if (value && (!value.startsWith("eyJ") || segments.length !== 3)) {
    issues.push(`${name} must be a complete Supabase JWT key.`);
  }

  return value;
}

export function getProductionEnvIssues() {
  const issues: string[] = [];

  requireCleanEnv("DATABASE_URL", issues);
  const nextAuthSecret = requireCleanEnv("NEXTAUTH_SECRET", issues);
  requireHttpsUrl("NEXTAUTH_URL", issues);
  requireHttpsUrl("NEXT_PUBLIC_SITE_URL", issues);

  if (nextAuthSecret && nextAuthSecret.length < 32) {
    issues.push("NEXTAUTH_SECRET must be at least 32 characters.");
  }

  requireLiveRazorpayKey("RAZORPAY_KEY_ID", issues);
  requireLiveRazorpayKey("NEXT_PUBLIC_RAZORPAY_KEY_ID", issues);
  requireCleanEnv("RAZORPAY_KEY_SECRET", issues);
  requireCleanEnv("RAZORPAY_WEBHOOK_SECRET", issues);

  const smtpHost = requireCleanEnv("SMTP_HOST", issues);
  requireCleanEnv("SMTP_USER", issues);
  requireCleanEnv("SMTP_PASS", issues);
  requireCleanEnv("EMAIL_FROM", issues);

  if (smtpHost.toLowerCase().includes("ethereal.email")) {
    issues.push("SMTP_HOST must use a real production mail provider, not Ethereal.");
  }

  const hasSupabaseStorage =
    Boolean(valueOf("NEXT_PUBLIC_SUPABASE_URL") || valueOf("SUPABASE_URL")) &&
    Boolean(valueOf("SUPABASE_SERVICE_ROLE_KEY") || valueOf("SUPABASE_ANON_KEY") || valueOf("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
  const hasCloudinaryStorage =
    Boolean(valueOf("CLOUDINARY_CLOUD_NAME")) &&
    (Boolean(valueOf("CLOUDINARY_UPLOAD_PRESET")) ||
      (Boolean(valueOf("CLOUDINARY_API_KEY")) && Boolean(valueOf("CLOUDINARY_API_SECRET"))));

  if (!hasSupabaseStorage && !hasCloudinaryStorage) {
    issues.push("Configure persistent upload storage with Supabase Storage or Cloudinary.");
  }

  if (hasSupabaseStorage) {
    if (valueOf("NEXT_PUBLIC_SUPABASE_URL")) {
      requireHttpsUrl("NEXT_PUBLIC_SUPABASE_URL", issues);
    } else {
      requireHttpsUrl("SUPABASE_URL", issues);
    }

    if (valueOf("SUPABASE_SERVICE_ROLE_KEY")) {
      requireSupabaseJwt("SUPABASE_SERVICE_ROLE_KEY", issues);
    } else if (valueOf("SUPABASE_ANON_KEY")) {
      requireSupabaseJwt("SUPABASE_ANON_KEY", issues);
    } else {
      requireSupabaseJwt("NEXT_PUBLIC_SUPABASE_ANON_KEY", issues);
    }
  }

  return issues;
}

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const issues = getProductionEnvIssues();
  if (issues.length > 0) {
    throw new Error(`Production environment is not launch-ready:\n- ${issues.join("\n- ")}`);
  }
}

export function getRequiredProductionEnv(name: string) {
  const value = valueOf(name);
  const isNextProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

  if (process.env.NODE_ENV === "production" && !isNextProductionBuild && isUnsafeValue(value)) {
    throw new Error(`${name} must be configured with a real production value.`);
  }

  return value;
}

export function getNextAuthSecret() {
  return (
    getRequiredProductionEnv("NEXTAUTH_SECRET") ||
    "development-only-nextauth-secret-do-not-use-in-production"
  );
}

export function getSiteUrl() {
  const siteUrl = valueOf("NEXT_PUBLIC_SITE_URL");
  if (siteUrl) return cleanBaseUrl(siteUrl);

  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error("NEXT_PUBLIC_SITE_URL must be configured with your public production domain.");
  }

  return "https://elantraa.com";
}
