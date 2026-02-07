/*
  Warnings:

  - You are about to drop the column `studentId` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ResidencyStatus" AS ENUM ('LOCAL', 'INTERNATIONAL');

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_studentId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_parentId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_schoolId_fkey";

-- DropIndex
DROP INDEX "loans_studentId_idx";

-- DropIndex
DROP INDEX "school_profiles_schoolEmail_key";

-- DropIndex
DROP INDEX "school_profiles_schoolPhone_key";

-- DropIndex
DROP INDEX "school_profiles_userId_key";

-- AlterTable
ALTER TABLE "loans" DROP COLUMN "studentId",
ADD COLUMN     "accountHolderName" VARCHAR(255),
ADD COLUMN     "accountNumber" VARCHAR(50),
ADD COLUMN     "bankName" VARCHAR(100),
ADD COLUMN     "companyName" VARCHAR(255),
ADD COLUMN     "countryOfBankAccount" VARCHAR(100),
ADD COLUMN     "countryOfStudy" VARCHAR(100),
ADD COLUMN     "employmentStatus" VARCHAR(100),
ADD COLUMN     "jobTitleRole" VARCHAR(255),
ADD COLUMN     "monthlyNetIncome" DECIMAL(15,2),
ADD COLUMN     "paymentFrequency" VARCHAR(50),
ADD COLUMN     "programCourseOfStudy" VARCHAR(255),
ADD COLUMN     "residencyStatus" "ResidencyStatus" NOT NULL DEFAULT 'LOCAL',
ALTER COLUMN "term" DROP NOT NULL;

-- AlterTable
ALTER TABLE "school_profiles" ADD COLUMN     "academicLevel" VARCHAR(100),
ADD COLUMN     "currentAcademicSession" VARCHAR(50),
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "schoolEmail" DROP NOT NULL,
ALTER COLUMN "schoolPhone" DROP NOT NULL,
ALTER COLUMN "contactPersonName" DROP NOT NULL,
ALTER COLUMN "contactPersonPosition" DROP NOT NULL,
ALTER COLUMN "contactPersonEmail" DROP NOT NULL,
ALTER COLUMN "contactPersonPhone" DROP NOT NULL,
ALTER COLUMN "bankName" DROP NOT NULL,
ALTER COLUMN "accountNumber" DROP NOT NULL,
ALTER COLUMN "accountName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isFirstTime" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "residencyStatus" "ResidencyStatus" NOT NULL DEFAULT 'LOCAL';

-- DropTable
DROP TABLE "students";

-- CreateTable
CREATE TABLE "verification_logs" (
    "id" UUID NOT NULL,
    "verificationId" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "activity" VARCHAR(255) NOT NULL,
    "details" TEXT,
    "status" "VerificationStatus" NOT NULL,
    "performedBy" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_support_messages" (
    "id" UUID NOT NULL,
    "schoolId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "priority" VARCHAR(50) NOT NULL DEFAULT 'normal',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "school_support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_logs_verificationId_idx" ON "verification_logs"("verificationId");

-- CreateIndex
CREATE INDEX "verification_logs_schoolId_idx" ON "verification_logs"("schoolId");

-- CreateIndex
CREATE INDEX "verification_logs_createdAt_idx" ON "verification_logs"("createdAt");

-- CreateIndex
CREATE INDEX "school_support_messages_schoolId_idx" ON "school_support_messages"("schoolId");

-- CreateIndex
CREATE INDEX "school_support_messages_isRead_idx" ON "school_support_messages"("isRead");

-- CreateIndex
CREATE INDEX "school_support_messages_createdAt_idx" ON "school_support_messages"("createdAt");

-- CreateIndex
CREATE INDEX "loans_residencyStatus_idx" ON "loans"("residencyStatus");

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "school_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
