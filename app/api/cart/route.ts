import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get("userId");
  const guestId = searchParams.get("guestId");

  if (!userId) {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (userEmail) {
      const user = await prisma.user.findFirst({ where: { email: userEmail } });
      if (user) {
        userId = user.id;
      }
    }
  }

  if (!userId && !guestId) {
    return NextResponse.json({ cart: null });
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { guestId: guestId || undefined },
      include: {
        items: {
          include: {
            product: true,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, productId, size, color, quantity } = body;
    let userId = body.userId;

    if (!userId) {
      const session = await getServerSession(authOptions);
      const userEmail = session?.user?.email;
      if (userEmail) {
        const user = await prisma.user.findFirst({ where: { email: userEmail } });
        if (user) {
          userId = user.id;
        }
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { guestId: guestId || "default_guest" },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: userId ? { userId } : { guestId: guestId || "default_guest" },
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
        data: { quantity: existingItem.quantity + (quantity || 1) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          size: size || null,
          color: color || null,
          quantity: quantity || 1,
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
