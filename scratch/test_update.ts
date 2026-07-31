import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

async function testUpdate() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString: connectionString! });
  const prisma = new PrismaClient({ adapter });

  // Get first product
  const product = await prisma.product.findFirst();
  if (!product) {
    console.log("No product found to update.");
    return;
  }

  console.log("Found product:", product.name, "ID:", product.id);

  // Update product info fields directly in DB
  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      productInformation: "Bespoke handcrafted silk couture gown with metallic thread embroidery.",
      deliveryTimelines: "Express Dispatch: 24-48 hours. Nationwide Delivery: 2-3 Business Days.",
      disclaimer: "Every piece is individually handcrafted. Minor variations in weave texture may occur.",
      additionalInfo: "Fabric: 100% Organic Silk. Dry clean only. Made in India.",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      productInformation: true,
      deliveryTimelines: true,
      disclaimer: true,
      additionalInfo: true,
    },
  });

  console.log("UPDATE SUCCESSFUL! Output record:");
  console.log(JSON.stringify(updated, null, 2));
}

testUpdate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
