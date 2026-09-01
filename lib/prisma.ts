import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

let rawUrl = process.env.DATABASE_URL?.trim() || "";
if (
  (rawUrl.startsWith('"') && rawUrl.endsWith('"')) ||
  (rawUrl.startsWith("'") && rawUrl.endsWith("'"))
) {
  rawUrl = rawUrl.slice(1, -1).trim();
}

const connectionString =
  rawUrl || "postgresql://postgres:postgres@localhost:5432/elantraa?schema=public";

const isSupabase =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com");

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

