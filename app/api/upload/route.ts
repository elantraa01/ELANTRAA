import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
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

    // Check size limit for serverless environment (Netlify/Vercel limit: ~4.5MB)
    const MAX_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5 MB
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `File size (${sizeMB}MB) exceeds serverless upload limit (max 4.5MB on Netlify). Please paste a video/image URL directly instead.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if running in Netlify or serverless environment
    const isServerless =
      Boolean(process.env.NETLIFY) ||
      Boolean(process.env.VERCEL) ||
      process.env.NODE_ENV === "production";

    if (isServerless) {
      const base64Data = `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: base64Data,
        fileName: file.name,
      });
    }

    // Local development: Write file to public/uploads directory
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const cleanFileName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const uniqueFileName = `${Date.now()}-${cleanFileName}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: uniqueFileName,
      });
    } catch {
      // Fallback for serverless or read-only filesystems in production
      const base64Data = `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: base64Data,
        fileName: file.name,
      });
    }
  } catch (error) {
    console.error("File upload error:", error);
    const msg = error instanceof Error ? error.message : "Failed to upload file.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
