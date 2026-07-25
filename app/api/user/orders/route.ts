import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ orders: [], addresses: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ orders: [], addresses: [] });
    }

    const formattedOrders = user.orders.map((order) => {
      const firstItem = order.items[0];
      const summary = order.items
        .map((i) => `${i.product.name}${i.size ? ` (Size: ${i.size})` : ""}`)
        .join(" + ");

      return {
        id: order.id,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        totalAmount: Number(order.totalAmount),
        status: order.status,
        itemsCount: order.items.length,
        sampleImage: firstItem?.product.images[0] || "/images/collections/dresses.png",
        itemsSummary: summary || "Custom Order Item",
      };
    });

    const formattedAddresses = user.addresses.map((addr) => ({
      id: addr.id,
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      isDefault: addr.isDefault,
    }));

    return NextResponse.json({
      orders: formattedOrders,
      addresses: formattedAddresses,
    });
  } catch (error) {
    console.error("GET /api/user/orders error:", error);
    return NextResponse.json({ orders: [], addresses: [] });
  }
}
