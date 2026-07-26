import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Women", slug: "women" },
  { name: "Men", slug: "men" },
  { name: "Lehenga choli", slug: "lehenga-choli", parentSlug: "women" },
  { name: "Saree", slug: "saree", parentSlug: "women" },
  { name: "Anarkali Suits", slug: "anarkali-suits", parentSlug: "women" },
  { name: "Dresses", slug: "dresses", parentSlug: "women" },
  { name: "Tops", slug: "tops", parentSlug: "women" },
  { name: "Shirts", slug: "shirts", parentSlug: "men" },
  { name: "Kurta Sets", slug: "kurta-sets", parentSlug: "men" },
  { name: "Outerwear", slug: "outerwear" },
  { name: "Accessories", slug: "accessories" },
];

const products = [
  {
    name: "Aurelia Satin Wrap Dress",
    slug: "aurelia-satin-wrap-dress",
    description: "A gold-toned satin wrap dress with a soft drape and evening-ready finish.",
    price: "5499.00",
    discountPrice: "4799.00",
    categorySlug: "dresses",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Champagne", "Ivory"],
    images: ["/images/products/aurelia-satin-wrap-dress-1.jpg", "/images/products/aurelia-satin-wrap-dress-2.jpg"],
    stock: 32,
    isFeatured: true,
  },
  {
    name: "Noor Embroidered Kurta Set",
    slug: "noor-embroidered-kurta-set",
    description: "A lightweight kurta set with tonal embroidery and a relaxed festive silhouette.",
    price: "3999.00",
    discountPrice: "3499.00",
    categorySlug: "tops",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Gold"],
    images: ["/images/products/noor-embroidered-kurta-set-1.jpg", "/images/products/noor-embroidered-kurta-set-2.jpg"],
    stock: 48,
    isFeatured: true,
  },
  {
    name: "Elan Classic Oxford Shirt",
    slug: "elan-classic-oxford-shirt",
    description: "A crisp cotton oxford shirt designed for sharp everyday styling.",
    price: "2499.00",
    discountPrice: null,
    categorySlug: "shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Sky Blue"],
    images: ["/images/products/elan-classic-oxford-shirt-1.jpg", "/images/products/elan-classic-oxford-shirt-2.jpg"],
    stock: 64,
    isFeatured: false,
  },
  {
    name: "Siena Linen Co-ord Set",
    slug: "siena-linen-coord-set",
    description: "A breathable linen blend co-ord set with tailored ease.",
    price: "4299.00",
    discountPrice: "3799.00",
    categorySlug: "tops",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Ivory", "Sage"],
    images: ["/images/products/siena-linen-coord-set-1.jpg", "/images/products/siena-linen-coord-set-2.jpg"],
    stock: 27,
    isFeatured: true,
  },
  {
    name: "Ryder Textured Overshirt",
    slug: "ryder-textured-overshirt",
    description: "A textured layerable overshirt with utility pockets and a structured fit.",
    price: "3299.00",
    discountPrice: "2999.00",
    categorySlug: "outerwear",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Stone", "Olive"],
    images: ["/images/products/ryder-textured-overshirt-1.jpg", "/images/products/ryder-textured-overshirt-2.jpg"],
    stock: 36,
    isFeatured: false,
  },
  {
    name: "Mira Pleated Midi Skirt",
    slug: "mira-pleated-midi-skirt",
    description: "A fluid pleated midi skirt with a clean waistband and soft movement.",
    price: "2899.00",
    discountPrice: null,
    categorySlug: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pearl", "Black"],
    images: ["/images/products/mira-pleated-midi-skirt-1.jpg", "/images/products/mira-pleated-midi-skirt-2.jpg"],
    stock: 41,
    isFeatured: false,
  },
  {
    name: "Arden Slim Chino",
    slug: "arden-slim-chino",
    description: "A polished slim chino with stretch comfort for workdays and weekends.",
    price: "2799.00",
    discountPrice: "2399.00",
    categorySlug: "men",
    sizes: ["30", "32", "34", "36", "38"],
    colors: ["Khaki", "Navy"],
    images: ["/images/products/arden-slim-chino-1.jpg", "/images/products/arden-slim-chino-2.jpg"],
    stock: 58,
    isFeatured: false,
  },
  {
    name: "Leora Pearl Button Blouse",
    slug: "leora-pearl-button-blouse",
    description: "A refined blouse with pearl-style buttons and a softly structured collar.",
    price: "2299.00",
    discountPrice: "1999.00",
    categorySlug: "tops",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Blush"],
    images: ["/images/products/leora-pearl-button-blouse-1.jpg", "/images/products/leora-pearl-button-blouse-2.jpg"],
    stock: 52,
    isFeatured: true,
  },
  {
    name: "Cairo Quilted Jacket",
    slug: "cairo-quilted-jacket",
    description: "A lightweight quilted jacket with a minimal profile and warm lining.",
    price: "4999.00",
    discountPrice: "4499.00",
    categorySlug: "outerwear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Charcoal"],
    images: ["/images/products/cairo-quilted-jacket-1.jpg", "/images/products/cairo-quilted-jacket-2.jpg"],
    stock: 24,
    isFeatured: true,
  },
  {
    name: "Sol Gold Accent Tote",
    slug: "sol-gold-accent-tote",
    description: "A structured everyday tote finished with subtle gold hardware.",
    price: "3599.00",
    discountPrice: null,
    categorySlug: "accessories",
    sizes: ["One Size"],
    colors: ["White", "Tan"],
    images: ["/images/products/sol-gold-accent-tote-1.jpg", "/images/products/sol-gold-accent-tote-2.jpg"],
    stock: 44,
    isFeatured: true,
  },
];

async function main() {
  const categoryBySlug = new Map<string, { id: string }>();

  for (const category of categories.filter((item) => !item.parentSlug)) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { name: category.name, slug: category.slug },
      select: { id: true },
    });

    categoryBySlug.set(category.slug, saved);
  }

  for (const category of categories.filter((item) => item.parentSlug)) {
    const parent = categoryBySlug.get(category.parentSlug!);

    if (!parent) {
      throw new Error(`Missing parent category for ${category.slug}`);
    }

    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, parentCategoryId: parent.id },
      create: { name: category.name, slug: category.slug, parentCategoryId: parent.id },
      select: { id: true },
    });

    categoryBySlug.set(category.slug, saved);
  }

  for (const product of products) {
    const category = categoryBySlug.get(product.categorySlug);

    if (!category) {
      throw new Error(`Missing category for ${product.slug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        discountPrice: product.discountPrice ? new Prisma.Decimal(product.discountPrice) : null,
        categoryId: category.id,
        sizes: product.sizes,
        colors: product.colors,
        images: product.images,
        stock: product.stock,
        isFeatured: product.isFeatured,
        isActive: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        discountPrice: product.discountPrice ? new Prisma.Decimal(product.discountPrice) : null,
        categoryId: category.id,
        sizes: product.sizes,
        colors: product.colors,
        images: product.images,
        stock: product.stock,
        isFeatured: product.isFeatured,
        isActive: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
