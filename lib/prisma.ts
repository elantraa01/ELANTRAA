import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function sanitizeDatabaseUrl(raw?: string): string {
  if (!raw) return "";
  let str = raw.trim();
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }

  // Auto-encode special characters like @ in password
  const regex = /^postgres(?:ql)?:\/\/([^:]+):(.*)@([^@\/]+(?::\d+)?(?:\/.*)?)$/;
  const match = str.match(regex);
  if (match) {
    const [, user, pass, rest] = match;
    try {
      const decodedPass = decodeURIComponent(pass);
      const encodedPass = encodeURIComponent(decodedPass);
      return `postgresql://${user}:${encodedPass}@${rest}`;
    } catch {
      return str;
    }
  }

  return str;
}

const connectionString =
  sanitizeDatabaseUrl(process.env.DATABASE_URL) ||
  "postgresql://postgres:postgres@localhost:5432/elantraa?schema=public";

const isSupabase =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com");

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

globalForPrisma.pool = pool;

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

globalForPrisma.prisma = prisma;

