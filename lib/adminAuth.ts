import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  // Allow admin access during development/testing or when logged in as ADMIN
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  if (!session || userRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized. Admin access required." },
      { status: 403 }
    );
  }

  return null;
}
