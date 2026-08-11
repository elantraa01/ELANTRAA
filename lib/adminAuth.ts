import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  // Optional local-only escape hatch for manual admin testing.
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_ADMIN_DEV_BYPASS === "true"
  ) {
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
