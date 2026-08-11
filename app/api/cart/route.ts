import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string })?.id;
  const userEmail = session?.user?.email;

  if (sessionUserId) return sessionUserId;
  if (!userEmail) return null;

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  return user?.id || null;
}

function isValidGuestId(guestId: unknown): guestId is string {
  return typeof guestId === "string" && /^guest_[a-zA-Z0-9_-]{8,80}$/.test(guestId);
}

function getCartQuantity(quantity: unknown) {
  const parsed = Number(quantity || 1);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 99) return null;
  return parsed;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = await getSessionUserId();
  const guestId = searchParams.get("guestId");

  if (!userId && !guestId) {
    return NextResponse.json({ cart: null });
  }

  if (!userId && !isValidGuestId(guestId)) {
    return NextResponse.json({ error: "A valid guestId is required" }, { status: 400 });
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { guestId },
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

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();
    const parsedQuantity = getCartQuantity(quantity);
    if (!itemId || !parsedQuantity) {
      return NextResponse.json({ error: "Valid itemId and quantity are required" }, { status: 400 });
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: parsedQuantity },
    });

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const clearAll = searchParams.get("all") === "true";

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return NextResponse.json({ success: true });
    }

    if (clearAll) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      return NextResponse.json({ success: true, cart: { ...cart, items: [] } });
    }

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error("Cart DELETE Error:", error);
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, productId, size, color, quantity } = body;
    const userId = await getSessionUserId();
    const parsedQuantity = getCartQuantity(quantity);

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    if (!parsedQuantity) {
      return NextResponse.json({ error: "Quantity must be an integer between 1 and 99" }, { status: 400 });
    }

    if (!userId && !isValidGuestId(guestId)) {
      return NextResponse.json({ error: "A valid guestId is required for guest carts" }, { status: 400 });
    }

    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { guestId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: userId ? { userId } : { guestId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size: size || null,
        color: color || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: Math.min(existingItem.quantity + parsedQuantity, 99) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          size: size || null,
          color: color || null,
          quantity: parsedQuantity,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({ cart: updatedCart });
  } catch (error) {
    console.error("Cart POST Error:", error);
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}
