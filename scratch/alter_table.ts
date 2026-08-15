import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Connecting to DATABASE_URL:", connectionString ? connectionString.substring(0, 35) + "..." : "MISSING");
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing in environment");
  }

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  console.log("Checking and adding columns to Product table...");
  await client.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "productInformation" TEXT;`);
  await client.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deliveryTimelines" TEXT;`);
  await client.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "disclaimer" TEXT;`);
  await client.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "additionalInfo" TEXT;`);
  await client.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sizeChart" TEXT;`);
  await client.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sizeChartCm" TEXT;`);
  console.log("SUCCESSFULLY added sizeChart and sizeChartCm columns to Product table!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
