import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log("Applying Partial COD / 50% Advance columns and enum values...");

    // 1. Add PARTIALLY_PAID to PaymentStatus enum if not exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'PARTIALLY_PAID'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PaymentStatus')
        ) THEN
          ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_PAID';
        END IF;
      END$$;
    `);

    // 2. Add columns to Order table
    await client.query(`
      ALTER TABLE "Order" 
        ADD COLUMN IF NOT EXISTS "advanceAmount" DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS "balanceAmount" DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'ONLINE';
    `);

    console.log("Migration executed successfully! Partial COD columns and enum ready.");
  } catch (err) {
    console.error("Error applying SQL migration:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
