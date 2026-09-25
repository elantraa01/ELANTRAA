import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LOGO_PNG_BASE64, FOUNDER_JPG_BASE64 } from "@/lib/imageFallbacks";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const rawSegments = params?.path || [];
    if (rawSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Clean and sanitize file segments to prevent path traversal
    const safeSegments = rawSegments.map((s) => path.basename(decodeURIComponent(s)));
    const relativeFilePath = path.join(...safeSegments);
    const fileName = safeSegments[safeSegments.length - 1].toLowerCase();

    // Check candidate locations on server disk
    const candidatePaths = [
      path.join(process.cwd(), "public", "images", relativeFilePath),
      path.join(process.cwd(), ".next", "standalone", "public", "images", relativeFilePath),
      path.join(__dirname, "..", "..", "..", "public", "images", relativeFilePath),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const buffer = await fs.promises.readFile(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || "application/octet-stream";

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    }

    // High-reliability fallbacks for critical brand assets
    if (fileName.includes("logo") || relativeFilePath.includes("logo")) {
      const buffer = Buffer.from(LOGO_PNG_BASE64, "base64");
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (fileName.includes("founder") || relativeFilePath.includes("founder")) {
      const buffer = Buffer.from(FOUNDER_JPG_BASE64, "base64");
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse("Image Not Found", { status: 404 });
  } catch (error) {
    console.error("Error serving dynamic image fallback:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
