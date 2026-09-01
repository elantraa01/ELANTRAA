import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.local first, fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

function sanitizeDbUrl(raw?: string): string {
  if (!raw) return "";
  let str = raw.trim();
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }
  const regex = /^postgres(?:ql)?:\/\/([^:]+):(.*)@([^@\/]+(?::\d+)?(?:\/.*)?)$/;
  const match = str.match(regex);
  if (match) {
    const [, user, pass, rest] = match;
    try {
      const decodedPass = decodeURIComponent(pass);
      return `postgresql://${user}:${encodeURIComponent(decodedPass)}@${rest}`;
    } catch {
      return str;
    }
  }
  return str;
}

const rawDb = process.env["DIRECT_URL"] || process.env["DATABASE_URL"];
const dbUrl =
  sanitizeDbUrl(rawDb) ||
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
