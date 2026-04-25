/**
 * Wallet Service (Updated for Embedly Integration)
 * Business logic for wallet operations with Embedly virtual account funding
 * Wallet is funded automatically via Embedly inflow webhook (no checkout flow)
 */

import { WalletRepository, IWalletRepository } from '@/src/repositories/WalletRepository';
import { TransactionRepository, ITransactionRepository } from '@/src/repositories/TransactionRepository';
import { executeWalletOperation, prisma } from '@/src/database/prisma';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { NotifyService } from '@/src/services/NotifyService';

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
 * (kept for debitWallet compatibility)
 */
export interface FundWalletInput {
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
  note?: string;
  userEmail: string;
}

/**
 * Inflow Webhook Credit Input
 */
export interface HandleInflowWebhookInput {
  /** Embedly virtual account number that received money */
  accountNumber: string;
  amount: number;
  transactionReference: string;
  narration?: string;
  /** ISO timestamp of the inflow event */
  occurredAt?: string;
}

/**
 * Wallet Service Interface
 */
export interface IWalletService {
  getBalance(userId: string): Promise<number>;
  getWalletDetails(userId: string): Promise<{
    balance: number;
    currency: string;
    autoDebitEnabled: boolean;
    virtualAccountNumber: string | null;
    virtualAccountBank: string | null;
    embedlyWalletId: string | null;
  }>;
  getUpcomingRepayment(userId: string, loanId?: string): Promise<{ amount: number; dueDate: string } | null>;
  getFundingHistory(userId: string): Promise<{ count: number; period: string } | null>;
  handleInflowWebhook(input: HandleInflowWebhookInput): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }>;
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

  constructor(
    walletRepository?: IWalletRepository,
    transactionRepository?: ITransactionRepository
  ) {
    this.walletRepository = walletRepository || new WalletRepository();
    this.transactionRepository = transactionRepository || new TransactionRepository();
  }

  /**
   * Get wallet balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    console.log({ msg: 'Getting wallet balance', userId });
    return await this.walletRepository.getBalance(userId);
  }

  /**
   * Get wallet details including virtual account details for Embedly
   */
  async getWalletDetails(userId: string): Promise<{
    balance: number;
    currency: string;
    autoDebitEnabled: boolean;
    virtualAccountNumber: string | null;
    virtualAccountBank: string | null;
    embedlyWalletId: string | null;
  }> {
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
      autoDebitEnabled: wallet.autoDebitEnabled || false,
      virtualAccountNumber: (wallet as any).virtualAccountNumber ?? null,
      virtualAccountBank: (wallet as any).virtualAccountBank ?? null,
      embedlyWalletId: (wallet as any).embedlyWalletId ?? null,
    };
  }

  /**
   * Get upcoming repayment for a user
   */
  async getUpcomingRepayment(userId: string, loanId?: string): Promise<{ amount: number; dueDate: string } | null> {
    console.log({ msg: 'Getting upcoming repayment', userId, loanId });
    
    try {
      const upcomingInstallment = await prisma.installment.findFirst({
        where: {
          loan: {
            userId,
            status: { in: ['ACTIVE', 'DISBURSED'] },
            ...(loanId ? { id: loanId } : {}),
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
   * Handle Embedly inflow webhook — credit user wallet when money lands in virtual account
   * This is the ONLY way wallets get funded (no checkout flow)
   * Idempotent: duplicate webhook deliveries are safely ignored
   */
  async handleInflowWebhook(
    input: HandleInflowWebhookInput
  ): Promise<{ wallet: WalletDTO; transaction: TransactionDTO }> {
    const { accountNumber, amount, transactionReference, narration, occurredAt } = input;

    console.log({
      msg: 'Processing inflow webhook',
      accountNumber,
      amount,
      transactionReference,
    });

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ValidationError('Invalid inflow amount');
    }

    // ── Idempotency: skip if already processed ─────────────────────────────────
    const existing = await this.transactionRepository.findByReference(transactionReference).catch(() => null);
    if (existing && existing.status === TransactionStatus.COMPLETED) {
      console.log({ msg: 'Duplicate inflow webhook — already processed', transactionReference });
      const wallet = await this.walletRepository.findByUserId(existing.userId);
      if (!wallet) throw new NotFoundError('Wallet not found');
      return { wallet: toWalletDTO(wallet), transaction: toTransactionDTO(existing) };
    }

    // ── Lookup wallet by virtual account number ───────────────────────────────
    const wallet = await prisma.wallet.findFirst({
      where: { virtualAccountNumber: accountNumber } as any,
    });

    if (!wallet) {
      console.error({ msg: 'No wallet found for virtual account', accountNumber });
      throw new NotFoundError(`No wallet found for virtual account ${accountNumber}`);
    }

    const userId = wallet.userId;

    // ── Credit wallet atomically ──────────────────────────────────────────────
    const result = await executeWalletOperation(async (tx) => {
      const freshWallet = await tx.wallet.findUnique({ where: { userId } });
      if (!freshWallet) throw new NotFoundError('Wallet not found');

      const balanceBefore = Number(freshWallet.balance);
      const balanceAfter = balanceBefore + amount;

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          transactionReference,
          userId,
          walletId: freshWallet.id,
          type: TransactionType.CREDIT,
          amount,
          balanceBefore,
          balanceAfter,
          description: narration || 'Wallet funded via bank transfer',
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          status: TransactionStatus.COMPLETED,
          gatewayReference: transactionReference,
          transactionDate: occurredAt ? new Date(occurredAt) : new Date(),
          metadata: {
            source: 'embedly_inflow_webhook',
            virtualAccountNumber: accountNumber,
            narration,
          },
        },
      });

      return {
        wallet: toWalletDTO(updatedWallet),
        transaction: toTransactionDTO(transaction),
      };
    });

    console.log({
      msg: 'Wallet funded via inflow webhook',
      userId,
      amount,
      transactionReference,
    });

    // ── Send notification ──────────────────────────────────────────────────────
    const notify = new NotifyService();
    const dbUser = await prisma.user
      .findUnique({ where: { id: userId }, select: { email: true, fullName: true } })
      .catch(() => null);
    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
    notify.send({
      userId,
      type: 'SUCCESS',
      title: 'Wallet Funded',
      message: `Your wallet has been funded with ${formattedAmount}.`,
      actionUrl: '/dashboard/wallet',
      category: 'wallet_funding',
      email: dbUser?.email
        ? {
            to: dbUser.email,
            fullName: dbUser.fullName,
            method: (mail: any) =>
              mail.sendWalletFundedEmail(dbUser.email, dbUser.fullName, amount),
          }
        : undefined,
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