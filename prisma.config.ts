import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.local first, fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl =
  process.env["DIRECT_URL"] ||
  process.env["DATABASE_URL"] ||
  (process.env["NODE_ENV"] === "production"
    ? (() => {
        throw new Error("DATABASE_URL must be set in production.");
      })()
    : "postgresql://postgres:postgres@localhost:5432/elantraa?schema=public");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
