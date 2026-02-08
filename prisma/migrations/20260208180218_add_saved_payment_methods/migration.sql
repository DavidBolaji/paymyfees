-- CreateTable
CREATE TABLE "saved_payment_methods" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "authorizationCode" VARCHAR(255) NOT NULL,
    "cardType" VARCHAR(50) NOT NULL,
    "last4" VARCHAR(4) NOT NULL,
    "expMonth" VARCHAR(2) NOT NULL,
    "expYear" VARCHAR(4) NOT NULL,
    "bank" VARCHAR(100),
    "brand" VARCHAR(50) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "saved_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_payment_methods_userId_idx" ON "saved_payment_methods"("userId");

-- CreateIndex
CREATE INDEX "saved_payment_methods_authorizationCode_idx" ON "saved_payment_methods"("authorizationCode");
