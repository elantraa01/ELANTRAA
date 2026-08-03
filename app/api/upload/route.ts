import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/adminAuth";

const MAX_SIZE_BYTES = 4.5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function cleanFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) return null;
  if (uploadPreset) return { cloudName, uploadPreset, apiKey: null, apiSecret: null };
  if (apiKey && apiSecret) return { cloudName, uploadPreset: null, apiKey, apiSecret };

  return null;
}

async function uploadToCloudinary(file: File) {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const form = new FormData();
  form.append("file", file);
  form.append("folder", "elantraa/uploads");

  if (config.uploadPreset) {
    form.append("upload_preset", config.uploadPreset);
  } else if (config.apiKey && config.apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signaturePayload = `folder=elantraa/uploads&timestamp=${timestamp}${config.apiSecret}`;
    const signature = crypto.createHash("sha1").update(signaturePayload).digest("hex");

    form.append("api_key", config.apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", signature);
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.secure_url !== "string") {
    const message = typeof data.error?.message === "string" ? data.error.message : "Cloudinary upload failed";
    throw new Error(message);
  }

  return {
    url: data.secure_url as string,
    fileName: typeof data.public_id === "string" ? data.public_id : file.name,
  };
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "File payload is too large for serverless upload (max 4.5MB). Please enter a direct URL instead." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload JPG, PNG, WebP, AVIF, or GIF images." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `File size (${sizeMB}MB) exceeds serverless upload limit (max 4.5MB on Netlify). Please paste a video/image URL directly instead.`,
        },
        { status: 400 }
      );
    }

    const isServerless =
      Boolean(process.env.NETLIFY) ||
      Boolean(process.env.VERCEL) ||
      process.env.NODE_ENV === "production";

    const cloudinaryUpload = await uploadToCloudinary(file);
    if (cloudinaryUpload) {
      return NextResponse.json({
        success: true,
        provider: "cloudinary",
        ...cloudinaryUpload,
      });
    }

    if (isServerless) {
      return NextResponse.json(
        {
          error: "Persistent upload storage is not configured. Set Cloudinary env vars or paste an external image URL.",
        },
        { status: 501 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Local development: Write file to public/uploads directory
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `${Date.now()}-${cleanFileName(file.name)}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;

      return NextResponse.json({
        success: true,
        provider: "local",
        url: publicUrl,
        fileName: uniqueFileName,
      });
    } catch (localError) {
      console.error("Local file upload error:", localError);
      return NextResponse.json({ error: "Failed to save uploaded file." }, { status: 500 });
    }
  } catch (error) {
    console.error("File upload error:", error);
    const msg = error instanceof Error ? error.message : "Failed to upload file.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
