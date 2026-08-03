CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minSpend" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

INSERT INTO "Coupon" ("id", "code", "type", "value", "minSpend", "isActive", "updatedAt")
VALUES
  ('default_elantraagold', 'ELANTRAAGOLD', 'percentage', 10, NULL, true, CURRENT_TIMESTAMP),
  ('default_welcome10', 'WELCOME10', 'fixed', 500, 2500, true, CURRENT_TIMESTAMP),
  ('default_festive15', 'FESTIVE15', 'percentage', 15, 4000, true, CURRENT_TIMESTAMP),
  ('default_elantraa10', 'ELANTRAA10', 'fixed', 300, NULL, true, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
