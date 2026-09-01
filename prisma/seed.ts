import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

let rawUrl = process.env.DATABASE_URL?.trim() || "";
if (
  (rawUrl.startsWith('"') && rawUrl.endsWith('"')) ||
  (rawUrl.startsWith("'") && rawUrl.endsWith("'"))
) {
  rawUrl = rawUrl.slice(1, -1).trim();
}

const isSupabase =
  rawUrl.includes("supabase.co") || rawUrl.includes("pooler.supabase.com");

const pool = new Pool({
  connectionString: rawUrl,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@elantraa.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMeAdmin123!";
  const adminName = process.env.ADMIN_NAME?.trim() || "ELANTRAA Admin";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  // 1. Seed Admin User
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("✔ Admin seeded successfully");

  // 2. Seed Hero Banner
  await prisma.heroBanner.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      announcement: "COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING ON ORDERS ABOVE ₹5,000",
      tagline: "AUTUMN / WINTER 2026 COLLECTION",
      title: "ELANTRAA",
      highlight: "& Timeless Elegance",
      description:
        "Immerse yourself in handcrafted silk gowns, tailored silhouettes, and intricate metallic embroidery designed for the discerning individual.",
      buttonText: "Explore Collection",
      buttonLink: "/shop",
      bgImage: "/images/hero/hero_banner.png",
      bgImages: [],
    },
  });
  console.log("✔ Default Hero Banner seeded successfully");

  // 3. Seed Default Categories
  const categories = [
    { name: "Women", slug: "women", image: "/images/categories/women.jpg" },
    { name: "Men", slug: "men", image: "/images/categories/men.jpg" },
    { name: "Ethnic Wear", slug: "ethnic-wear", image: "/images/categories/ethnic.jpg" },
    { name: "Dresses", slug: "dresses", image: "/images/categories/dresses.jpg" },
    { name: "Accessories", slug: "accessories", image: "/images/categories/accessories.jpg" },
    { name: "New Arrivals", slug: "new-arrivals", image: "/images/categories/new-arrivals.jpg" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, image: cat.image },
      create: { name: cat.name, slug: cat.slug, image: cat.image },
    });
  }
  console.log(`✔ ${categories.length} Categories seeded successfully`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Seed error:", error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
