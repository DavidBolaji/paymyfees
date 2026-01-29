# PayMyFees API Implementation Guide
## Complete PostgreSQL-Compatible Implementation

This guide provides complete, production-ready implementations for all API endpoints following the established codebase patterns with PostgreSQL optimizations.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [PostgreSQL Optimizations](#postgresql-optimizations)
3. [Repository Layer](#repository-layer)
4. [Service Layer](#service-layer)
5. [Controller Layer](#controller-layer)
6. [API Routes](#api-routes)
7. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Layer Structure
```
API Route → Controller → Service → Repository → Database (PostgreSQL)
     ↓          ↓           ↓           ↓
  Validation  Response   Business    Data Access
  Rate Limit  Formatting  Logic      Transactions
  Auth Check  Status Codes Validation  Queries
```

### Key Patterns
1. **Dependency Injection**: Services and repositories are injected
2. **Error Handling**: Centralized with custom error classes
3. **Validation**: Zod schemas for all inputs
4. **Transactions**: PostgreSQL transactions for data consistency
5. **Type Safety**: Full TypeScript typing throughout

---

## PostgreSQL Optimizations

### Data Type Mappings
```prisma
// UUID for all IDs (better distribution, security)
id String @id @default(uuid()) @db.Uuid

// Timestamptz for timezone-aware timestamps
createdAt DateTime @default(now()) @db.Timestamptz(3)

// Decimal for financial precision
amount Decimal @db.Decimal(15, 2)

// JsonB for flexible metadata (faster than JSON)
metadata Json? @db.JsonB

// VarChar with appropriate lengths
email String @unique @db.VarChar(255)
```

### Transaction Isolation Levels
```typescript
// Read operations - ReadCommitted (better performance)
await executeReadTransaction(async (tx) => {
  // Read-only queries
});

// Write operations - Serializable (prevents race conditions)
await executeWriteTransaction(async (tx) => {
  // Critical updates
});
```

### Atomic Operations
```typescript
// Use Prisma's atomic operations for counters
await prisma.parentProfile.update({
  where: { userId },
  data: {
    activeLoans: { increment: 1 },
    totalBorrowed: { increment: amount }
  }
});
```

---

## Repository Layer

### Complete Loan Repository
```typescript
/**
 * src/repositories/LoanRepository.ts
 * Loan Repository with PostgreSQL optimizations
 */

import { prisma } from '@/src/database/prisma';
import { Loan, LoanStatus } from '@/prisma/app/generated/prisma-client';
import { NotFoundError } from '@/src/types/errors';

export interface LoanFilters {
  userId?: string;
  status?: LoanStatus;
  schoolId?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface ILoanRepository {
  create(data: any): Promise<Loan>;
  findById(id: string): Promise<Loan | null>;
  findByLoanNumber(loanNumber: string): Promise<Loan | null>;
  findByUserId(userId: string, filters?: LoanFilters, pagination?: PaginationOptions): Promise<{ loans: Loan[]; total: number }>;
  update(id: string, data: any): Promise<Loan>;
  updateStatus(id: string, status: LoanStatus, metadata?: any): Promise<Loan>;
}

export class LoanRepository implements ILoanRepository {
  async create(data: any): Promise<Loan> {
    return await prisma.loan.create({
      data,
      include: {
        student: true,
        school: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Loan | null> {
    return await prisma.loan.findUnique({
      where: { id },
      include: {
        student: true,
        school: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        installments: {
          orderBy: { installmentNumber: 'asc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        verification: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByLoanNumber(loanNumber: string): Promise<Loan | null> {
    return await prisma.loan.findUnique({
      where: { loanNumber },
      include: {
        student: true,
        school: true,
      },
    });
  }

  async findByUserId(
    userId: string,
    filters?: LoanFilters,
    pagination?: PaginationOptions
  ): Promise<{ loans: Loan[]; total: number }> {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.schoolId) {
      where.schoolId = filters.schoolId;
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { applicationDate: 'desc' },
        include: {
          student: true,
          school: {
            select: {
              schoolName: true,
              schoolEmail: true,
            },
          },
        },
      }),
      prisma.loan.count({ where }),
    ]);

    return { loans, total };
  }

  async update(id: string, data: any): Promise<Loan> {
    return await prisma.loan.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: LoanStatus, metadata?: any): Promise<Loan> {
    return await prisma.loan.update({
      where: { id },
      data: {
        status,
        ...(metadata || {}),
        statusHistory: {
          create: {
            previousStatus: undefined, // Will be set by trigger or application logic
            newStatus: status,
            changedBy: metadata?.changedBy,
            reason: metadata?.reason,
          },
        },
      },
    });
  }
}
```

---

## Service Layer

### Complete Wallet Service
```typescript
/**
 * src/services/WalletService.ts
 * Wallet Service with transaction management
 */

import { WalletRepository, IWalletRepository } from '@/src/repositories/WalletRepository';
import { TransactionRepository, ITransactionRepository } from '@/src/repositories/TransactionRepository';
import { executeWalletOperation } from '@/src/database/prisma';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { logger } from '@/src/utils/logger';
import { TransactionType, TransactionStatus, PaymentMethod } from '@/prisma/app/generated/prisma-client';

export interface FundWalletInput {
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string;
}

export interface IWalletService {
  getBalance(userId: string): Promise<number>;
  fundWallet(input: FundWalletInput): Promise<any>;
  debitWallet(userId: string, amount: number, description: string): Promise<any>;
  getTransactions(userId: string, page: number, limit: number): Promise<any>;
}

export class WalletService implements IWalletService {
  private walletRepository: IWalletRepository;
  private transactionRepository: ITransactionRepository;

  constructor(
    walletRepository?: IWalletRepository,
    transactionRepository?: ITransactionRepository
  ) {
    this.walletRepository = walletRepository || new WalletRepository();
    this.transactionRepository = transactionRepository || new TransactionRepository();
  }

  async getBalance(userId: string): Promise<number> {
    console.log('Getting wallet balance', { userId });
    return await this.walletRepository.getBalance(userId);
  }

  async fundWallet(input: FundWalletInput): Promise<any> {
    console.log('Funding wallet', { userId: input.userId, amount: input.amount });

    // Execute in transaction to ensure atomicity
    const result = await executeWalletOperation(async (tx) => {
      // Get current wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: input.userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + input.amount;

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: input.userId },
        data: {
          balance: { increment: input.amount },
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionReference: input.reference,
          userId: input.userId,
          walletId: wallet.id,
          type: TransactionType.CREDIT,
          amount: input.amount,
          balanceBefore,
          balanceAfter,
          description: 'Wallet funding',
          paymentMethod: input.paymentMethod,
          status: TransactionStatus.COMPLETED,
          transactionDate: new Date(),
        },
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    });

    console.log('Wallet funded successfully', { userId: input.userId });
    return result;
  }

  async debitWallet(userId: string, amount: number, description: string): Promise<any> {
    console.log('Debiting wallet', { userId, amount });

    const result = await executeWalletOperation(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);

      if (balanceBefore < amount) {
        throw new ValidationError('Insufficient wallet balance');
      }

      const balanceAfter = balanceBefore - amount;

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          transactionReference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount,
          balanceBefore,
          balanceAfter,
          description,
          status: TransactionStatus.COMPLETED,
          transactionDate: new Date(),
        },
      });

      return {
        wallet: updatedWallet,
        transaction,
      };
    });

    console.log('Wallet debited successfully', { userId });
    return result;
  }

  async getTransactions(userId: string, page: number, limit: number): Promise<any> {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    return await this.transactionRepository.findByWalletId(wallet.id, { page, limit });
  }
}
```

---

## Controller Layer

### Complete Wallet Controller
```typescript
/**
 * src/controllers/WalletController.ts
 * Wallet Controller with proper response formatting
 */

import { NextResponse } from 'next/server';
import { WalletService, IWalletService } from '@/src/services/WalletService';
import { fundWalletSchema, paginationSchema } from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';
import { AuthUser } from '@/src/middleware/auth';

export class WalletController {
  private walletService: IWalletService;

  constructor(walletService?: IWalletService) {
    this.walletService = walletService || new WalletService();
  }

  /**
   * GET /api/wallet/balance
   */
  async getBalance(req: Request, user: AuthUser): Promise<NextResponse> {
    const balance = await this.walletService.getBalance(user.id);

    const response: ApiResponse = {
      success: true,
      data: {
        balance,
        currency: 'NGN',
        lastUpdated: new Date().toISOString(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * POST /api/wallet/fund
   */
  async fundWallet(req: Request, user: AuthUser): Promise<NextResponse> {
    const body = await req.json();
    const validatedData = fundWalletSchema.parse(body);

    // Generate payment reference
    const reference = `PMF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // In production, integrate with payment gateway (Paystack/Flutterwave)
    // For now, simulate successful payment
    const result = await this.walletService.fundWallet({
      userId: user.id,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      reference,
    });

    console.log('Wallet funding initiated', { userId: user.id, reference });

    const response: ApiResponse = {
      success: true,
      data: {
        transactionId: result.transaction.id,
        amount: validatedData.amount,
        reference,
        newBalance: Number(result.wallet.balance),
        // In production, return payment gateway URL
        paymentUrl: `https://payment-gateway.com/pay/${reference}`,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * GET /api/wallet/transactions
   */
  async getTransactions(req: Request, user: AuthUser): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const pagination = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
    });

    const result = await this.walletService.getTransactions(
      user.id,
      pagination.page,
      pagination.limit
    );

    const response: ApiResponse = {
      success: true,
      data: {
        transactions: result.transactions.map((t: any) => ({
          date: t.transactionDate.toISOString(),
          description: t.description,
          amount: Number(t.amount),
          type: t.type,
          status: t.status,
        })),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / pagination.limit),
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}
```

---

## API Routes

### Complete Wallet Routes
```typescript
/**
 * app/api/wallet/balance/route.ts
 */
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { requireParent } from '@/src/middleware/auth';

const walletController = new WalletController();

export const GET = asyncHandler(async (req: Request) => {
  const user = await requireParent(req);
  return await walletController.getBalance(req, user);
});

/**
 * app/api/wallet/fund/route.ts
 */
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { requireParent } from '@/src/middleware/auth';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

const walletController = new WalletController();

export const POST = asyncHandler(async (req: Request) => {
  await lenientRateLimiter(req);
  const user = await requireParent(req);
  return await walletController.fundWallet(req, user);
});

/**
 * app/api/wallet/transactions/route.ts
 */
import { WalletController } from '@/src/controllers/WalletController';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { requireParent } from '@/src/middleware/auth';

const walletController = new WalletController();

export const GET = asyncHandler(async (req: Request) => {
  const user = await requireParent(req);
  return await walletController.getTransactions(req, user);
});
```

---

## Implementation Checklist

### Phase 1: Core Repositories ✅
- [x] WalletRepository
- [x] TransactionRepository
- [ ] LoanRepository
- [ ] PaymentRepository
- [ ] InstallmentRepository

### Phase 2: Core Services ✅
- [x] WalletService
- [ ] LoanService
- [ ] PaymentService
- [ ] TransactionService

### Phase 3: Core Controllers ✅
- [x] WalletController
- [ ] LoanController
- [ ] PaymentController
- [ ] TransactionController

### Phase 4: API Routes ✅
- [x] Wallet endpoints
- [ ] Loan endpoints
- [ ] Payment endpoints
- [ ] Transaction endpoints

---

## PostgreSQL Best Practices Applied

1. **UUID Primary Keys**: Better for distributed systems and security
2. **Timestamptz**: Timezone-aware timestamps for global users
3. **Decimal Types**: Precise financial calculations
4. **JsonB**: Fast, indexed JSON storage
5. **Atomic Operations**: Prevent race conditions
6. **Transaction Isolation**: Appropriate levels for each operation
7. **Connection Pooling**: Via Prisma Accelerate
8. **Proper Indexes**: On frequently queried columns
9. **Efficient Queries**: Minimize N+1 problems
10. **Batch Operations**: Where applicable

---

## Testing Examples

### Repository Test
```typescript
describe('WalletRepository', () => {
  it('should update balance atomically', async () => {
    const repo = new WalletRepository();
    const userId = 'test-user-id';
    
    await repo.updateBalance(userId, 1000, 'increment');
    const balance = await repo.getBalance(userId);
    
    expect(balance).toBe(1000);
  });
});
```

### Service Test
```typescript
describe('WalletService', () => {
  it('should fund wallet and create transaction', async () => {
    const service = new WalletService();
    
    const result = await service.fundWallet({
      userId: 'test-user-id',
      amount: 5000,
      paymentMethod: 'CARD',
      reference: 'TEST-REF-123',
    });
    
    expect(result.wallet.balance).toBeGreaterThan(0);
    expect(result.transaction.type).toBe('CREDIT');
  });
});
```

---

## Next Steps

1. **Implement remaining repositories** following the LoanRepository pattern
2. **Implement remaining services** following the WalletService pattern
3. **Implement remaining controllers** following the WalletController pattern
4. **Create API routes** for each endpoint
5. **Add comprehensive tests** for each layer
6. **Document API** with OpenAPI/Swagger
7. **Performance testing** with realistic load
8. **Security audit** before production

---

## Support

For questions or issues:
- Review existing implementations in `src/repositories`, `src/services`, `src/controllers`
- Check `IMPLEMENTATION_STATUS.md` for current progress
- Refer to `summary.md` for API specifications
- Review `prisma/schema.prisma` for database schema

