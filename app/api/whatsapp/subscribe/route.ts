import { NextRequest, NextResponse } from "next/server";
import { saveWhatsAppSubscriber, getWhatsAppSubscribers } from "@/lib/whatsapp-subscribers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, name, source = "POPUP" } = body || {};

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid WhatsApp phone number." },
        { status: 400 }
      );
    }

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10 || cleanDigits.length > 15) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const { subscriber, isNew } = await saveWhatsAppSubscriber({
      phone: cleanDigits,
      name: typeof name === "string" ? name.trim() : undefined,
      source: String(source),
      discountCode: "ELANTRAAGOLD",
    });

    return NextResponse.json({
      success: true,
      isNew,
      discountCode: subscriber.discountCode,
      message: isNew
        ? "Welcome to ELANTRAA! Your 10% discount code has been unlocked."
        : "Welcome back to ELANTRAA! Your 10% discount code is active.",
    });
  } catch (error) {
    console.error("WhatsApp subscribe error:", error);
    return NextResponse.json(
      { error: "Unable to process subscription right now. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subscribers = await getWhatsAppSubscribers();
    return NextResponse.json({
      success: true,
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("WhatsApp subscribers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load subscribers." },
      { status: 500 }
    );
  }
}
