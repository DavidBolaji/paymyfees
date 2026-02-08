/**
 * Prisma Client Singleton with Prisma Accelerate
 * Implements connection pooling, caching, and transaction management
 * Optimized for PostgreSQL with Prisma Accelerate
 */

// import { PrismaClient, Transaction } from '@/prisma/app/generated/prisma-client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { env } from '@/src/config/env';
import { DatabaseError } from '@/src/types/errors';
import { PrismaClient, Transaction } from '@prisma/client';

/**
 * Extended Prisma Client type with Accelerate
 */
type PrismaClientWithAccelerate = ReturnType<typeof createPrismaClient>;

// Prisma Client singleton instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientWithAccelerate | undefined;
}

/**
 * Creates and configures Prisma Client instance with Accelerate extension
 * 
 * Best Practices:
 * - Uses singleton pattern to prevent connection pool exhaustion
 * - Configures appropriate logging based on environment
 * - Applies Accelerate extension for connection pooling and caching
 * - Handles graceful shutdown
 * - Optimized for high concurrency with connection limits
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: env.isDevelopment() 
      ? [
          { level: 'warn', emit: 'stdout' },
          { level: 'error', emit: 'stdout' },
        ]
      : [
          { level: 'error', emit: 'stdout' },
        ],
    errorFormat: env.isDevelopment() ? 'pretty' : 'minimal',
  });

  // Extend with Accelerate for connection pooling and caching
  // Accelerate handles connection pooling automatically
  const extendedClient = client.$extends(withAccelerate());

  return extendedClient;
}

/**
 * Get or create Prisma Client singleton
 * In development, reuse the same instance across hot reloads
 * In production, create a new instance
 */
export const prisma = global.prisma || createPrismaClient();

// Prevent multiple instances in development (hot reload)
if (env.isDevelopment()) {
  global.prisma = prisma;
}

/**
 * Transaction callback type
 * Properly typed for Prisma Client transactions
 */
export type TransactionCallback<T> = (
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
) => Promise<T>;

/**
 * Transaction options for PostgreSQL
 * Supports all PostgreSQL isolation levels
 */
export interface TransactionOptions {
  /** Maximum time to wait for a transaction slot (ms) */
  maxWait?: number;
  /** Maximum time the transaction can run (ms) */
  timeout?: number;
  /** PostgreSQL isolation level */
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}

/**
 * Execute operations within a transaction
 * Ensures all-or-nothing semantics for multi-step operations
 * 
 * @param callback - Function containing transaction operations
 * @param options - Transaction configuration options
 * @returns Result of the transaction callback
 * @throws DatabaseError if transaction fails
 * 
 * @example
 * ```typescript
 * const result = await executeTransaction(async (tx) => {
 *   const user = await tx.user.create({ data: { ... } });
 *   const wallet = await tx.wallet.create({ data: { userId: user.id, ... } });
 *   return { user, wallet };
 * });
 * ```
 */
export async function executeTransaction<T>(
  callback: TransactionCallback<T>,
  options: TransactionOptions = {}
): Promise<T> {
  try {
    const result = await prisma.$transaction(
      async (tx: Transaction) => {
        return await callback(tx as any);
      },
      {
        maxWait: options.maxWait || 5000, // 5 seconds
        timeout: options.timeout || 10000, // 10 seconds
        isolationLevel: options.isolationLevel,
      }
    );
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(`Transaction failed: ${error.message}`);
    }
    throw new DatabaseError('Transaction failed with unknown error');
  }
}

/**
 * Execute a read-only transaction
 * Optimized for queries that don't modify data
 * Uses ReadCommitted isolation level for better performance
 * 
 * @param callback - Function containing read operations
 * @returns Result of the read operations
 * 
 * @example
 * ```typescript
 * const data = await executeReadTransaction(async (tx) => {
 *   const user = await tx.user.findUnique({ where: { id } });
 *   const loans = await tx.loan.findMany({ where: { userId: id } });
 *   return { user, loans };
 * });
 * ```
 */
export async function executeReadTransaction<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  return executeTransaction(callback, {
    isolationLevel: 'ReadCommitted',
    timeout: 5000,
  });
}

/**
 * Execute a write transaction with serializable isolation
 * Ensures highest level of consistency for critical operations
 * Prevents phantom reads and write skew
 * 
 * @param callback - Function containing write operations
 * @returns Result of the write operations
 * 
 * @example
 * ```typescript
 * const result = await executeWriteTransaction(async (tx) => {
 *   await tx.wallet.update({
 *     where: { id },
 *     data: { balance: { decrement: amount } }
 *   });
 *   await tx.transaction.create({ data: { ... } });
 * });
 * ```
 */
export async function executeWriteTransaction<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  return executeTransaction(callback, {
    isolationLevel: 'Serializable',
    timeout: 15000,
  });
}

/**
 * Batch operation wrapper
 * Executes multiple operations in a single transaction
 * More efficient than individual operations
 * 
 * @param operations - Array of Prisma operations
 * @returns Array of operation results
 * 
 * @example
 * ```typescript
 * const results = await executeBatch([
 *   prisma.user.create({ data: { ... } }),
 *   prisma.wallet.create({ data: { ... } }),
 *   prisma.notification.create({ data: { ... } })
 * ]);
 * ```
 */
export async function executeBatch<T>(
  operations: Array<Promise<T>>
): Promise<T[]> {
  try {
    return await prisma.$transaction(operations);
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(`Batch operation failed: ${error.message}`);
    }
    throw new DatabaseError('Batch operation failed with unknown error');
  }
}

/**
 * Disconnect from database
 * Should be called during application shutdown
 * Ensures all pending queries complete and connections are closed
 * 
 * @example
 * ```typescript
 * process.on('SIGTERM', async () => {
 *   await disconnectDatabase();
 *   process.exit(0);
 * });
 * ```
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    throw error;
  }
}

/**
 * Connect to database
 * Useful for testing or manual connection management
 * Note: Prisma Client connects automatically on first query
 * 
 * @example
 * ```typescript
 * await connectDatabase();
 * ```
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw new DatabaseError('Failed to connect to database');
  }
}

/**
 * Check database connection health
 * Useful for health check endpoints
 * 
 * @returns true if database is accessible
 * 
 * @example
 * ```typescript
 * app.get('/health', async (req, res) => {
 *   const isHealthy = await checkDatabaseHealth();
 *   res.status(isHealthy ? 200 : 503).json({ database: isHealthy });
 * });
 * ```
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Execute raw SQL query with proper typing
 * Use with caution - prefer Prisma's type-safe queries when possible
 * 
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Query result
 * 
 * @example
 * ```typescript
 * const result = await executeRawQuery<User[]>`
 *   SELECT * FROM users WHERE email = ${email}
 * `;
 * ```
 */
export async function executeRawQuery<T = unknown>(
  query: TemplateStringsArray,
  ...params: any[]
): Promise<T> {
  try {
    return await prisma.$queryRaw(query, ...params) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw new DatabaseError(`Raw query failed: ${error.message}`);
    }
    throw new DatabaseError('Raw query failed with unknown error');
  }
}

/**
 * Transaction wrapper for creating related records atomically
 * Example: Creating a user with profile and wallet
 * 
 * @example
 * ```typescript
 * const result = await createUserWithRelations(async (tx) => {
 *   const user = await tx.user.create({ data: { ... } });
 *   const profile = await tx.parentProfile.create({ 
 *     data: { userId: user.id, ... } 
 *   });
 *   const wallet = await tx.wallet.create({ 
 *     data: { userId: user.id, ... } 
 *   });
 *   return { user, profile, wallet };
 * });
 * ```
 */
export async function createUserWithRelations<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  return executeWriteTransaction(callback);
}

/**
 * Transaction wrapper for updating multiple tables
 * Ensures data consistency across related entities
 * 
 * @example
 * ```typescript
 * await updateMultipleEntities(async (tx) => {
 *   await tx.loan.update({ where: { id }, data: { status: 'ACTIVE' } });
 *   await tx.parentProfile.update({ 
 *     where: { userId }, 
 *     data: { activeLoans: { increment: 1 } } 
 *   });
 * });
 * ```
 */
export async function updateMultipleEntities<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  return executeWriteTransaction(callback);
}

/**
 * Transaction wrapper for loan disbursement
 * Handles loan status update, disbursement creation, and school balance update
 * Uses Serializable isolation to prevent race conditions
 * 
 * @example
 * ```typescript
 * await executeLoanDisbursement(async (tx) => {
 *   const loan = await tx.loan.update({
 *     where: { id: loanId },
 *     data: { 
 *       status: 'DISBURSED',
 *       disbursementDate: new Date(),
 *       amountDisbursed: amount
 *     }
 *   });
 *   
 *   const disbursement = await tx.disbursement.create({
 *     data: { loanId, schoolId, amount, ... }
 *   });
 *   
 *   await tx.schoolProfile.update({
 *     where: { id: schoolId },
 *     data: { totalDisbursements: { increment: amount } }
 *   });
 *   
 *   return { loan, disbursement };
 * });
 * ```
 */
export async function executeLoanDisbursement<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  return executeWriteTransaction(callback);
}

/**
 * Transaction wrapper for payment processing
 * Handles payment creation, installment update, wallet deduction, and transaction recording
 * Critical operation requiring Serializable isolation
 * 
 * @example
 * ```typescript
 * await executePaymentProcessing(async (tx) => {
 *   const payment = await tx.payment.create({ data: { ... } });
 *   
 *   await tx.installment.update({
 *     where: { id: installmentId },
 *     data: { status: 'PAID', paidDate: new Date() }
 *   });
 *   
 *   const wallet = await tx.wallet.update({
 *     where: { userId },
 *     data: { balance: { decrement: amount } }
 *   });
 *   
 *   await tx.transaction.create({
 *     data: { 
 *       userId, 
 *       walletId: wallet.id, 
 *       type: 'DEBIT', 
 *       amount,
 *       balanceBefore: wallet.balance + amount,
 *       balanceAfter: wallet.balance
 *     }
 *   });
 *   
 *   await tx.loan.update({
 *     where: { id: loanId },
 *     data: { 
 *       amountRepaid: { increment: amount },
 *       outstandingBalance: { decrement: amount }
 *     }
 *   });
 *   
 *   return payment;
 * });
 * ```
 */
export async function executePaymentProcessing<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  return executeWriteTransaction(callback);
}

/**
 * Transaction wrapper for wallet operations
 * Ensures atomic balance updates and transaction recording
 * Prevents race conditions in concurrent wallet operations
 * 
 * @example
 * ```typescript
 * await executeWalletOperation(async (tx) => {
 *   const wallet = await tx.wallet.findUnique({ where: { userId } });
 *   
 *   if (!wallet || wallet.balance < amount) {
 *     throw new Error('Insufficient balance');
 *   }
 *   
 *   const updatedWallet = await tx.wallet.update({
 *     where: { userId },
 *     data: { balance: { decrement: amount } }
 *   });
 *   
 *   await tx.transaction.create({
 *     data: {
 *       userId,
 *       walletId: wallet.id,
 *       type: 'DEBIT',
 *       amount,
 *       balanceBefore: wallet.balance,
 *       balanceAfter: updatedWallet.balance,
 *       description: 'Payment'
 *     }
 *   });
 *   
 *   return updatedWallet;
 * });
 * ```
 */
export async function executeWalletOperation<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  return executeWriteTransaction(callback);
}

// Graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectDatabase();
  });

  process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

export default prisma;
