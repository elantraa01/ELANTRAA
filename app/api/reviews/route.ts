import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 4.8;

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        userName: r.user?.name || "Customer",
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
      })),
      averageRating: Number(averageRating.toFixed(1)),
      totalReviewsCount: reviews.length,
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ reviews: [], averageRating: 4.8, totalReviewsCount: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Please sign in to submit a review" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User profile not found" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid product ID and rating (1-5) required" }, { status: 400 });
    }

    const review = await prisma.review.upsert({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
      update: {
        rating: Number(rating),
        comment: comment ? String(comment).trim() : null,
      },
      create: {
        productId,
        userId,
        rating: Number(rating),
        comment: comment ? String(comment).trim() : null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
