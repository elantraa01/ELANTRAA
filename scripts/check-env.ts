import dotenv from "dotenv";
import { getProductionEnvIssues } from "../lib/env";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ path: ".env", quiet: true });

const previousNodeEnv = process.env.NODE_ENV;
(process.env as Record<string, string | undefined>).NODE_ENV = "production";

const issues = getProductionEnvIssues();

if (previousNodeEnv === undefined) {
  delete (process.env as Record<string, string | undefined>).NODE_ENV;
} else {
  (process.env as Record<string, string | undefined>).NODE_ENV = previousNodeEnv;
}

if (issues.length > 0) {
  console.error("Production environment is not launch-ready:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Production environment check passed.");
