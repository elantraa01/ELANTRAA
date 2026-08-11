import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("DATABASE_URL must be set in production.");
      })()
    : "postgresql://postgres:postgres@localhost:5432/elantraa?schema=public");

const adapter = new PrismaPg({ connectionString });

// Re-instantiate Prisma client with updated schema models
export const prisma =
  process.env.NODE_ENV === "development"
    ? new PrismaClient({ adapter })
    : (globalForPrisma.prisma ??= new PrismaClient({ adapter }));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
