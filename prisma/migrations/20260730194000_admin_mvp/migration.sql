ALTER TABLE "Category" ADD COLUMN "image" TEXT;
ALTER TABLE "Category" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Product" ADD COLUMN "sku" TEXT;

ALTER TYPE "OrderStatus" ADD VALUE 'PACKED';

CREATE TABLE "StoreSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'ELANTRAA',
    "storeLogo" TEXT NOT NULL DEFAULT '/images/logo/logo.png',
    "contactEmail" TEXT NOT NULL DEFAULT 'elantraa.01@gmail.com',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "shippingCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);
