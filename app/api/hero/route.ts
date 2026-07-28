import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hero = await prisma.heroBanner.findUnique({ where: { id: "default" } });
    return NextResponse.json({ hero });
  } catch (error) {
    console.error("GET /api/hero error:", error);
    return NextResponse.json({ hero: null }, { status: 500 });
  }
}
