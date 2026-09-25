import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    const safeSegments = rawSegments.map((s) => path.basename(decodeURIComponent(s)));
    const relativeFilePath = path.join(...safeSegments);

    const candidatePaths = [
      path.join(process.cwd(), "public", "uploads", relativeFilePath),
      path.join(process.cwd(), ".next", "standalone", "public", "uploads", relativeFilePath),
      path.join(__dirname, "..", "..", "..", "public", "uploads", relativeFilePath),
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

    return new NextResponse("Upload Not Found", { status: 404 });
  } catch (error) {
    console.error("Error serving dynamic upload fallback:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
