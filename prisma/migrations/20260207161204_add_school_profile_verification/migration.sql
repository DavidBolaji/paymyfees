/*
  Warnings:

  - You are about to drop the column `language` on the `parent_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `parent_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `notification_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notification_settings" DROP CONSTRAINT "notification_settings_userId_fkey";

-- AlterTable
ALTER TABLE "parent_profiles" DROP COLUMN "language",
DROP COLUMN "postalCode";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "twoFactorEnabled",
DROP COLUMN "twoFactorSecret";

-- DropTable
DROP TABLE "notification_settings";

-- CreateTable
CREATE TABLE "school_profile_verifications" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ(3),
    "reviewedBy" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "school_profile_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_profile_verification_logs" (
    "id" UUID NOT NULL,
    "verificationId" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "activity" VARCHAR(255) NOT NULL,
    "details" TEXT,
    "status" "VerificationStatus" NOT NULL,
    "performedBy" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_profile_verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_profile_verifications_schoolId_idx" ON "school_profile_verifications"("schoolId");

-- CreateIndex
CREATE INDEX "school_profile_verifications_userId_idx" ON "school_profile_verifications"("userId");

-- CreateIndex
CREATE INDEX "school_profile_verifications_status_idx" ON "school_profile_verifications"("status");

-- CreateIndex
CREATE INDEX "school_profile_verification_logs_verificationId_idx" ON "school_profile_verification_logs"("verificationId");

-- CreateIndex
CREATE INDEX "school_profile_verification_logs_schoolId_idx" ON "school_profile_verification_logs"("schoolId");

-- CreateIndex
CREATE INDEX "school_profile_verification_logs_createdAt_idx" ON "school_profile_verification_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "school_profile_verifications" ADD CONSTRAINT "school_profile_verifications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_profile_verification_logs" ADD CONSTRAINT "school_profile_verification_logs_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "school_profile_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
