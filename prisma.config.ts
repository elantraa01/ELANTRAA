import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.local first, fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl =
  process.env["DATABASE_URL"] ||
  "postgresql://postgres:postgres@localhost:5432/elantraa?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
