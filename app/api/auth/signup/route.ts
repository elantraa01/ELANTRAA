import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!phone || String(phone).trim().replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User in DB with phone
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error: unknown) {
    console.error("Signup POST Error:", error);
    const err = error as { message?: string; code?: string } | undefined;
    return NextResponse.json(
      {
        error: "Failed to create account. Please try again.",
        message: err?.message || String(error),
        code: err?.code,
      },
      { status: 500 }
    );
  }
}
