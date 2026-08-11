import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function isValidGuestId(guestId: unknown): guestId is string {
  return typeof guestId === "string" && /^guest_[a-zA-Z0-9_-]{8,80}$/.test(guestId);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string })?.id;
    const sessionEmail = session?.user?.email;

    const body = await req.json().catch(() => ({}));
    const { guestCartItems, guestId } = body;

    let targetUser = null;
    if (sessionEmail || sessionUserId) {
      targetUser = await prisma.user.findFirst({
        where: sessionUserId ? { id: sessionUserId } : { email: sessionEmail! },
      });
    }

    if (!targetUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = targetUser.id;

    // Find or create user DB cart
    let userCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // If guestCartItems provided from localStorage or DB guest cart
    if (Array.isArray(guestCartItems) && guestCartItems.length > 0) {
      for (const gItem of guestCartItems) {
        if (!gItem.productId) continue;

        const existing = userCart.items.find(
          (item) =>
            item.productId === gItem.productId &&
            item.size === (gItem.size || null) &&
            item.color === (gItem.color || null)
        );

        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + (gItem.quantity || 1) },
          });
        } else {
          // Verify product exists in DB before creating relation
          const prodExists = await prisma.product.findUnique({
            where: { id: gItem.productId },
          });

          if (prodExists) {
            await prisma.cartItem.create({
              data: {
                cartId: userCart.id,
                productId: gItem.productId,
                size: gItem.size || null,
                color: gItem.color || null,
                quantity: gItem.quantity || 1,
              },
            });
          }
        }
      }
    }

    // Clean up guest DB cart if exists
    if (guestId && isValidGuestId(guestId)) {
      const guestCart = await prisma.cart.findUnique({ where: { guestId } });
      if (guestCart) {
        await prisma.cart.delete({ where: { id: guestCart.id } });
      }
    }

    const finalCart = await prisma.cart.findUnique({
      where: { id: userCart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountPrice: true,
                images: true,
                stock: true,
                isReturnable: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Merged guest cart into user cart successfully",
      cart: finalCart,
    });
  } catch (error) {
    console.error("Cart Merge Error:", error);
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
  }
}
