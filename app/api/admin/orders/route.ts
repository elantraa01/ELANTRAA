import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((order) => ({
      id: order.id,
      totalAmount: Number(order.totalAmount),
      advanceAmount: order.advanceAmount ? Number(order.advanceAmount) : null,
      balanceAmount: order.balanceAmount ? Number(order.balanceAmount) : null,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || "ONLINE",
      createdAt: order.createdAt.toISOString(),
      customer: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku || "",
        productImage: item.product.images[0] || "",
        quantity: item.quantity,
        price: Number(item.price),
        size: item.size,
        color: item.color,
      })),
      timeline: buildTimeline(order.status, order.createdAt.toISOString()),
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("Admin Orders GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const allowedStatuses = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { user: true, items: { include: { product: true } } },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Admin Order PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}

function buildTimeline(status: string, createdAt: string) {
  const steps = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
  const currentIndex = status === "CANCELLED" ? 0 : steps.indexOf(status);

  if (status === "CANCELLED") {
    return [
      { status: "PENDING", label: "Order placed", completed: true, date: createdAt },
      { status: "CANCELLED", label: "Order cancelled", completed: true, date: null },
    ];
  }

  return steps.map((step, index) => ({
    status: step,
    label: step.charAt(0) + step.slice(1).toLowerCase(),
    completed: index <= currentIndex,
    date: index === 0 ? createdAt : null,
  }));
}
