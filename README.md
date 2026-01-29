# PayMyFees - Backend Application

Complete backend application for PayMyFees education financing platform with Prisma ORM, dependency injection, comprehensive validation, and production-ready architecture.

## 🏗️ Architecture

This application follows a strict three-layer architecture with SOLID principles:

- **Controllers Layer**: HTTP request/response handling, route parameters, status codes
- **Services Layer**: Business logic, data transformation, validation orchestration, transactions
- **Database Layer**: Prisma client interactions, query construction, data persistence

## 🚀 Features

- ✅ **Prisma ORM** with comprehensive database schema
- ✅ **Dependency Injection** with custom IoC container
- ✅ **TypeScript** with strict mode and explicit type annotations
- ✅ **Zod Validation** for all inputs and outputs
- ✅ **Custom Error Classes** for different failure scenarios
- ✅ **Transaction Wrappers** for atomic operations
- ✅ **Middleware** for error handling, rate limiting, authentication
- ✅ **Structured Logging** with Pino
- ✅ **JWT Authentication** with refresh tokens
- ✅ **SOLID Principles** throughout the codebase

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- pnpm (recommended) or npm

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd paymyfees
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your configuration values. **Required variables:**
   - `DATABASE_URL`: MySQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)
   - `REFRESH_TOKEN_SECRET`: Secret key for refresh tokens (min 32 characters)

4. **Generate Prisma Client**
   ```bash
   pnpm prisma:generate
   ```

5. **Run database migrations**
   ```bash
   pnpm prisma:migrate
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
paymyfees/
├── prisma/
│   └── schema.prisma          # Database schema with all models
├── src/
│   ├── config/
│   │   └── env.ts             # Environment configuration with validation
│   ├── database/
│   │   └── prisma.ts          # Prisma client singleton & transaction wrappers
│   ├── di/
│   │   └── container.ts       # Dependency injection container
│   ├── middleware/
│   │   ├── auth.ts            # Authentication middleware
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── rateLimiter.ts    # Rate limiting
│   ├── types/
│   │   ├── errors.ts          # Custom error classes
│   │   └── index.ts           # Type definitions and interfaces
│   ├── utils/
│   │   └── logger.ts          # Structured logging utility
│   └── validation/
│       └── schemas.ts         # Zod validation schemas
├── app/
│   └── api/                   # Next.js API routes
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration (strict mode)
└── README.md                  # This file
```

## 🗄️ Database Schema

The application includes a comprehensive database schema with:

- **User Management**: Users, ParentProfile, SchoolProfile, Student
- **Loan Management**: Loan, Installment, Payment, Disbursement
- **Verification**: SchoolVerification, Document
- **Wallet & Transactions**: Wallet, Transaction
- **Communication**: Notification, EmailLog, SmsLog
- **Support**: SupportTicket, SupportMessage, FAQ
- **System**: AuditLog, SystemSetting, PaymentReminder

All models include:
- Proper relations with foreign keys
- Cascade behaviors for data integrity
- Indexes for query optimization
- Default values and constraints
- Timestamps (createdAt, updatedAt)

## 🔐 Authentication

The application uses JWT-based authentication:

```typescript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

Include the token in subsequent requests:
```
Authorization: Bearer <token>
```

## 🔄 Transaction Management

All critical operations use Prisma transactions:

```typescript
import { executeWriteTransaction } from '@/src/database/prisma';

// Example: Create loan with installments atomically
await executeWriteTransaction(async (tx) => {
  const loan = await tx.loan.create({ ... });
  await tx.installment.createMany({ ... });
  return loan;
});
```

Available transaction wrappers:
- `executeTransaction()` - General purpose
- `executeReadTransaction()` - Read-only operations
- `executeWriteTransaction()` - Write operations with serializable isolation
- `executeLoanDisbursement()` - Loan disbursement workflow
- `executePaymentProcessing()` - Payment processing workflow
- `executeWalletOperation()` - Wallet operations

## ✅ Validation

All inputs are validated using Zod schemas:

```typescript
import { createLoanSchema } from '@/src/validation/schemas';

// Validate input
const validatedData = createLoanSchema.parse(requestBody);
```

Validation errors return structured responses:
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "loanAmount",
      "message": "Loan amount must be positive"
    }
  ]
}
```

## 🎯 Dependency Injection

Services are registered in the DI container:

```typescript
import { container, Injectable, ServiceLifecycle } from '@/src/di/container';

// Register service
@Injectable(ServiceLifecycle.SINGLETON)
class UserService {
  // Service implementation
}

// Resolve service
const userService = container.resolve(UserService);
```

## 🚦 Rate Limiting

Three rate limiting tiers:

- **Strict** (5 requests/minute): Authentication endpoints
- **Standard** (100 requests/15min): General endpoints
- **Lenient** (200 requests/15min): Public endpoints

```typescript
import { strictRateLimiter } from '@/src/middleware/rateLimiter';

// Apply rate limiting
await strictRateLimiter(request);
```

## 📝 Logging

Structured logging with Pino:

```typescript
import { logger } from '@/src/utils/logger';

console.log('User logged in', { userId: user.id });
console.error('Payment failed', { error, paymentId });
```

## 🧪 Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm type-check            # Run TypeScript type checking

# Database
pnpm prisma:generate       # Generate Prisma Client
pnpm prisma:migrate        # Run database migrations
pnpm prisma:studio         # Open Prisma Studio GUI
pnpm prisma:seed           # Seed database with test data

# Production
pnpm build                 # Build for production
pnpm start                 # Start production server

# Code Quality
pnpm lint                  # Run ESLint
pnpm format                # Format code with Prettier
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token generation and validation
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Input Validation**: Comprehensive Zod schemas
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Error Handling**: No sensitive data in error responses
- **CORS**: Configurable origin whitelist
- **Audit Logging**: Track all critical operations

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/confirm` - Confirm password reset

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Loans
- `POST /api/loans/apply` - Apply for loan
- `GET /api/loans/:loanId` - Get loan details
- `GET /api/loans/history` - Get loan history
- `POST /api/loans/:loanId/documents` - Upload documents

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/fund` - Fund wallet
- `GET /api/wallet/verify/:reference` - Verify funding
- `GET /api/wallet/transactions` - Get wallet transactions

### Payments
- `POST /api/payments/make` - Make payment
- `GET /api/payments/:paymentId/receipt` - Get payment receipt

### Transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:transactionId` - Get transaction details

### School Verification
- `POST /api/school-verification` - Submit verification request
- `GET /api/school-verification/status` - Get verification status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/chart` - Get chart data
- `GET /api/dashboard/analytics` - Get analytics

### Support
- `GET /api/support/faqs` - Get FAQs
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets` - Get support tickets

### Waitlist
- `POST /api/early-access` - Join waitlist

## 🏭 Production Deployment

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=<production-database-url>
   # ... other production variables
   ```

2. **Build the application**
   ```bash
   pnpm build
   ```

3. **Run database migrations**
   ```bash
   pnpm prisma:migrate
   ```

4. **Start the server**
   ```bash
   pnpm start
   ```

### Recommended Hosting

- **Application**: Vercel, AWS, DigitalOcean
- **Database**: AWS RDS, PlanetScale, DigitalOcean Managed MySQL
- **File Storage**: AWS S3, Cloudinary
- **Monitoring**: Sentry, LogRocket

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Maintain strict TypeScript typing (no `any` types)
3. Write comprehensive validation schemas
4. Use transactions for multi-step operations
5. Add proper error handling
6. Include JSDoc comments for public APIs
7. Follow SOLID principles

## 📄 License

[Your License Here]

## 📞 Support

For support, email support@paymyfees.co or create an issue in the repository.

---

**Built with ❤️ for accessible education financing**
