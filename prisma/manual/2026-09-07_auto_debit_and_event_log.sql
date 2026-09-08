-- Auto-debit + event log
-- Adds: auto_debit_attempts, event_logs
--
-- NOTE ON APPLYING THIS
-- The prisma/migrations/ history is written in PostgreSQL syntax (UUID,
-- TIMESTAMPTZ, quoted identifiers) while the datasource is now MySQL, so
-- `prisma migrate dev` cannot replay it. Use one of:
--
--   1. npx prisma db push          (recommended — syncs schema, no history)
--   2. mysql < this file           (apply the DDL directly)
--
-- Both are additive here: only two new tables, no changes to existing ones.

-- CreateTable
CREATE TABLE `auto_debit_attempts` (
    `id` CHAR(36) NOT NULL,
    `installmentId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `loanId` CHAR(36) NOT NULL,
    `attemptDate` DATE NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `amountAttempted` DECIMAL(15, 2) NOT NULL,
    `walletBalance` DECIMAL(15, 2) NOT NULL,
    `shortfall` DECIMAL(15, 2) NULL,
    `failureReason` VARCHAR(500) NULL,
    `transactionReference` VARCHAR(100) NULL,
    `userEmailSent` BOOLEAN NOT NULL DEFAULT false,
    `supportNotified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    -- The idempotency guard: re-running the cron on the same day is a no-op,
    -- so a manual retrigger cannot double-charge anyone.
    UNIQUE INDEX `auto_debit_attempts_installmentId_attemptDate_key`(`installmentId`, `attemptDate`),
    INDEX `auto_debit_attempts_userId_idx`(`userId`),
    INDEX `auto_debit_attempts_status_idx`(`status`),
    INDEX `auto_debit_attempts_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_logs` (
    `id` CHAR(36) NOT NULL,
    `eventType` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `severity` VARCHAR(20) NOT NULL DEFAULT 'info',
    `userId` CHAR(36) NULL,
    `entityType` VARCHAR(50) NULL,
    `entityId` CHAR(36) NULL,
    `requestId` VARCHAR(64) NULL,
    `message` VARCHAR(500) NOT NULL,
    `metadata` JSON NULL,
    `durationMs` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_logs_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `event_logs_category_createdAt_idx`(`category`, `createdAt`),
    INDEX `event_logs_eventType_idx`(`eventType`),
    INDEX `event_logs_requestId_idx`(`requestId`),
    INDEX `event_logs_severity_createdAt_idx`(`severity`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- No foreign key on event_logs.userId by design: a log row must survive user
-- deletion and must never fail to write because of a stale id.
