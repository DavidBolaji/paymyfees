/**
 * Wallet Service (Updated with Paystack Integration)
 * Business logic for wallet operations including Paystack payment processing
 */

import { WalletRepository, IWalletRepository } from '@/src/repositories/WalletRepository';
import { TransactionRepository, ITransactionRepository } from '@/src/repositories/TransactionRepository';
import { PaystackService, IPaystackService, PaymentInitializationResult } from '@/src/services/PaystackService';
import { executeWalletOperation, prisma } from '@/src/database/prisma';
import { ValidationError, NotFoundError, PaymentError } from '@/src/types/errors';

import { 
  TransactionType, 
  TransactionStatus, 
  PaymentMethod 
} from '@prisma/client';
import { 
  WalletDTO, 
  TransactionDTO, 
  DebitWalletInput,
  PaginationParams
} from '@/src/types';

/**
 * Fund Wallet Input Interface
 */
export interface FundWalletInput {
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
  note?: string;
  userEmail: string; // Required for Paystack
}

/**
 * Initialize Payment Input
 */
export interface InitializePaymentInput {
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
  note?: string;
  userEmail: string;
  callbackUrl?: string;
}

/**
 * Wallet Service Interface
 */
export interface IWalletService {
  getBalance(userId: string): Promise<number>;
  getWalletDetails(userId: string): Promise<{ balance: number; currency: string; autoDebitEnabled: boolean }>;
  getUpcomingRepayment(userId: string): Promise<{ amount: number; dueDate: string } | null>;
  getFundingHistory(userId: string): Promise<{ count: number; period: string } | null>;
  initializePayment(input: InitializePaymentInput): Promise<{ paymentUrl: string; reference: string; accessCode: string }>;
  verifyAndFundWallet(reference: string, userId: string): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }>;
  debitWallet(input: DebitWalletInput): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }>;
  getTransactions(userId: string, pagination: PaginationParams): Promise<{ transactions: TransactionDTO[]; total: number; page: number; limit: number }>;
  getWalletChartData(userId: string, period?: string): Promise<{ month: string; fundings: number; repayments: number }[]>;
}

/**
 * Convert Prisma Wallet to WalletDTO
 */
function toWalletDTO(wallet: any): WalletDTO {
  return {
    ...wallet,
    balance: Number(wallet.balance),
    dailyLimit: wallet.dailyLimit ? Number(wallet.dailyLimit) : null,
    monthlyLimit: wallet.monthlyLimit ? Number(wallet.monthlyLimit) : null
  };
}

/**
 * Convert Prisma Transaction to TransactionDTO
 */
function toTransactionDTO(transaction: any): TransactionDTO {
  return {
    ...transaction,
    amount: Number(transaction.amount),
    balanceBefore: Number(transaction.balanceBefore),
    balanceAfter: Number(transaction.balanceAfter)
  };
}

/**
 * Wallet Service Implementation
 */
export class WalletService implements IWalletService {
  private walletRepository: IWalletRepository;
  private transactionRepository: ITransactionRepository;
  private paystackService: IPaystackService;

  constructor(
    walletRepository?: IWalletRepository,
    transactionRepository?: ITransactionRepository,
    paystackService?: IPaystackService
  ) {
    this.walletRepository = walletRepository || new WalletRepository();
    this.transactionRepository = transactionRepository || new TransactionRepository();
    this.paystackService = paystackService || new PaystackService();
  }

  /**
   * Get wallet balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    console.log({ msg: 'Getting wallet balance', userId });
    return await this.walletRepository.getBalance(userId);
  }

  /**
   * Get wallet details including auto-debit status
   */
  async getWalletDetails(userId: string): Promise<{ balance: number; currency: string; autoDebitEnabled: boolean }> {
    console.log({ msg: 'Getting wallet details', userId });
    
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }
    
    return {
      balance: Number(wallet.balance),
      currency: wallet.currency,
      autoDebitEnabled: wallet.autoDebitEnabled || false
    };
  }

  /**
   * Get upcoming repayment for a user
   */
  async getUpcomingRepayment(userId: string): Promise<{ amount: number; dueDate: string } | null> {
    console.log({ msg: 'Getting upcoming repayment', userId });
    
    try {
      const upcomingInstallment = await prisma.installment.findFirst({
        where: {
          loan: {
            userId,
            status: { in: ['ACTIVE', 'DISBURSED'] }
          },
          status: 'PENDING',
        },
        orderBy: {
          dueDate: 'asc'
        }
      });
      
      if (upcomingInstallment) {
        const dueDate = new Date(upcomingInstallment.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        
        return {
          amount: Number(upcomingInstallment.amount),
          dueDate: formattedDate
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting upcoming repayment:', error);
      return null;
    }
  }

  /**
   * Get funding history stats for a user
   */
  async getFundingHistory(userId: string): Promise<{ count: number; period: string } | null> {
    console.log({ msg: 'Getting funding history', userId });
    
    try {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      
      const fundingCount = await prisma.transaction.count({
        where: {
          userId,
          type: TransactionType.CREDIT,
          status: TransactionStatus.COMPLETED,
          transactionDate: {
            gte: startOfYear
          }
        }
      });
      
      if (fundingCount > 0) {
        return {
          count: fundingCount,
          period: 'Year'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting funding history:', error);
      return null;
    }
  }

  /**
   * Initialize payment with Paystack
   * Creates a pending transaction and returns payment URL
   */
  async initializePayment(input: InitializePaymentInput): Promise<{ paymentUrl: string; reference: string; accessCode: string }> {
    console.log({ msg: 'Initializing payment', userId: input.userId, amount: input.amount });

    // Validate amount
    if (input.amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    // Generate unique reference
    const reference = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create pending transaction in database
    await executeWalletOperation(async (tx) => {
      // Get wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: input.userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      // Create pending transaction
      await tx.transaction.create({
        data: {
          transactionReference: reference,
          userId: input.userId,
          walletId: wallet.id,
          type: TransactionType.CREDIT,
          amount: input.amount,
          balanceBefore: Number(wallet.balance),
          balanceAfter: Number(wallet.balance), // Will be updated on verification
          description: input.note || 'Wallet funding',
          paymentMethod: input.paymentMethod,
          status: TransactionStatus.PENDING,
          transactionDate: new Date(),
          metadata: {
            currency: input.currency || 'NGN',
            note: input.note,
          },
        },
      });
    });

    // Initialize payment with Paystack
    const paymentResult = await this.paystackService.initializePayment({
      email: input.userEmail,
      amount: PaystackService.toKobo(input.amount),
      reference,
      currency: input.currency || 'NGN',
      callbackUrl: input.callbackUrl,
      metadata: {
        userId: input.userId,
        paymentMethod: input.paymentMethod,
        note: input.note,
      },
    });

    console.log({ 
      msg: 'Payment initialized successfully', 
      userId: input.userId, 
      reference 
    });

    return {
      paymentUrl: paymentResult.authorizationUrl,
      reference: paymentResult.reference,
      accessCode: paymentResult.accessCode,
    };
  }

  /**
   * Verify payment with Paystack and fund wallet
   * Updates transaction status and wallet balance
   */
  async verifyAndFundWallet(reference: string, userId: string): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }> {
    console.log({ msg: 'Verifying payment and funding wallet', reference, userId });

    // Find transaction
    const transaction = await this.transactionRepository.findByReference(reference);

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    // Verify transaction belongs to user
    if (transaction.userId !== userId) {
      throw new ValidationError('Unauthorized to verify this transaction');
    }

    // If already completed, return existing data
    if (transaction.status === TransactionStatus.COMPLETED) {
      const wallet = await this.walletRepository.findByUserId(userId);
      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }
      return {
        wallet: toWalletDTO(wallet),
        transaction: toTransactionDTO(transaction),
      };
    }

    // Verify payment with Paystack
    const verificationResult = await this.paystackService.verifyPayment(reference);

    if (!verificationResult.success) {
      // Update transaction status to failed
      const updatedTransaction = await executeWalletOperation(async (tx) => {
        return await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.FAILED,
            gatewayResponse: verificationResult.gatewayResponse,
           //@ts-ignore
            metadata: {
              ...(transaction.metadata as object),
              verificationResult,
            },
          },
        });
      });

      throw new PaymentError('Payment verification failed', reference);
    }

    // Payment successful - update wallet and transaction
    const result = await executeWalletOperation(async (tx) => {
      // Get current wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      const amount = verificationResult.amount;
      const balanceAfter = balanceBefore + amount;

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: { increment: amount },
        },
      });

      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          amount,
          balanceBefore,
          balanceAfter,
          gatewayResponse: verificationResult.gatewayResponse,
          //@ts-ignore
          metadata: {
            ...(transaction.metadata as object),
            verificationResult,
            paidAt: verificationResult.paidAt,
            channel: verificationResult.channel,
          },
        },
      });

      return {
        wallet: toWalletDTO(updatedWallet),
        transaction: toTransactionDTO(updatedTransaction),
      };
    });

    console.log({ 
      msg: 'Payment verified and wallet funded successfully', 
      userId, 
      reference,
      amount: verificationResult.amount 
    });

    return result;
  }

  /**
   * Debit wallet
   */
  async debitWallet(input: DebitWalletInput): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }> {
    console.log({ msg: 'Debiting wallet', userId: input.userId, amount: input.amount });

    const result = await executeWalletOperation(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: input.userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);

      if (balanceBefore < input.amount) {
        throw new ValidationError('Insufficient wallet balance');
      }

      const balanceAfter = balanceBefore - input.amount;

      const updatedWallet = await tx.wallet.update({
        where: { userId: input.userId },
        data: {
          balance: { decrement: input.amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          transactionReference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: input.userId,
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount: input.amount,
          balanceBefore,
          balanceAfter,
          description: input.description,
          category: input.category,
          status: TransactionStatus.COMPLETED,
          transactionDate: new Date(),
        },
      });

      return {
        wallet: toWalletDTO(updatedWallet),
        transaction: toTransactionDTO(transaction)
      };
    });

    console.log({ msg: 'Wallet debited successfully', userId: input.userId });
    return result;
  }

  /**
   * Get wallet transactions
   */
  async getTransactions(userId: string, pagination: PaginationParams): Promise<{ transactions: TransactionDTO[]; total: number; page: number; limit: number }> {
    console.log({ msg: 'Getting wallet transactions', userId });

    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    const { transactions, total } = await this.transactionRepository.findByWalletId(
      wallet.id,
      {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
      }
    );

    return {
      transactions: transactions.map(t => toTransactionDTO(t)),
      total,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
    };
  }

  /**
   * Get wallet chart data
   */
  async getWalletChartData(userId: string, period: string = '6months'): Promise<{ month: string; fundings: number; repayments: number }[]> {
    console.log({ msg: 'Getting wallet chart data', userId, period });
    
    try {
      const months = parseInt(period.replace(/[^0-9]/g, '') || '6');
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          transactionDate: 'asc',
        },
      });
      
      interface MonthLabel {
        month: string;
        year: number;
        monthIndex: number;
        yearMonth: string;
      }
      
      const monthLabels: MonthLabel[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        monthLabels.push({
          month: currentDate.toLocaleString('default', { month: 'short' }),
          year: currentDate.getFullYear(),
          monthIndex: currentDate.getMonth(),
          yearMonth: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      const chartData = monthLabels.map(monthInfo => ({
        month: monthInfo.month,
        fundings: 0,
        repayments: 0,
      }));
      
      transactions.forEach((transaction: any) => {
        const txDate = new Date(transaction.transactionDate);
        const txYearMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        
        const monthIndex = monthLabels.findIndex(m => m.yearMonth === txYearMonth);
        if (monthIndex !== -1 && chartData[monthIndex]) {
          const amount = Number(transaction.amount);
          
          if (transaction.type === TransactionType.CREDIT && transaction.status === TransactionStatus.COMPLETED) {
            chartData[monthIndex].fundings += amount;
          }
          
          if (transaction.type === TransactionType.DEBIT && transaction.status === TransactionStatus.COMPLETED) {
            chartData[monthIndex].repayments += amount;
          }
        }
      });
      
      return chartData;
    } catch (error) {
      console.error('Error getting wallet chart data:', error);
      return [];
    }
  }
}