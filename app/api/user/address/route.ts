import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ addresses: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ addresses: [] });
    }

    return NextResponse.json({ addresses: user.addresses });
  } catch (error) {
    console.error("GET /api/user/address error:", error);
    return NextResponse.json({ addresses: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, line1, line2, city, state, pincode, country = "India", isDefault = false } = body;

    if (!line1 || !city || !pincode) {
      return NextResponse.json(
        { error: "Line 1, City, and Pincode are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { addresses: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If setting as default, unset other default addresses for this user
    if (isDefault || user.addresses.length === 0) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        name: name || user.name || null,
        phone: phone || null,
        line1,
        line2: line2 || null,
        city,
        state: state || "",
        pincode,
        country,
        isDefault: isDefault || user.addresses.length === 0,
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error) {
    console.error("POST /api/user/address error:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.address.deleteMany({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/user/address error:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, phone, line1, line2, city, state, pincode, country = "India", isDefault } = body;

    if (!id || !line1 || !city || !pincode) {
      return NextResponse.json(
        { error: "Address ID, Line 1, City, and Pincode are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: existingAddress.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        line1,
        line2: line2 || null,
        city,
        state: state || "",
        pincode,
        country,
        ...(typeof isDefault === "boolean" ? { isDefault } : {}),
      },
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error) {
    console.error("PATCH /api/user/address error:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}
