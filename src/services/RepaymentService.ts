/**
 * Repayment Service (FIXED)
 * Business logic for loan repayments from wallet
 * 
 * Rules:
 * 1. Full installment amounts only (no partial payments)
 * 2. Always pay the next due installment
 * 3. If insufficient balance, tell user to top up
 * 4. Confirmation modal before deduction (handled in UI)
 */
import { WalletRepository, IWalletRepository } from '@/src/repositories/WalletRepository';

import { executeWalletOperation, prisma } from '@/src/database/prisma';
import { ValidationError, NotFoundError } from '@/src/types/errors';

import { 
  TransactionType, 
  TransactionStatus, 
  PaymentStatus,
  LoanStatus 
} from '@prisma/client';

/**
 * Make Repayment Input (simplified - no amount parameter)
 */
export interface MakeRepaymentInput {
  userId: string;
  installmentId: string;
}

/**
 * Repayment Result
 */
export interface RepaymentResult {
  success: boolean;
  installmentId: string;
  amountPaid: number;
  newWalletBalance: number;
  installmentStatus: PaymentStatus;
  loanStatus: LoanStatus;
  transactionReference: string;
}

/**
 * Next Due Installment
 */
export interface NextDueInstallment {
  id: string;
  amount: number;
  dueDate: Date;
  loanNumber: string;
  schoolName: string;
  installmentNumber: number;
  daysUntilDue: number;
  lateFee: number;
  totalAmount: number;
}

/**
 * User Installments Summary
 */
export interface UserInstallmentsSummary {
  nextDue: NextDueInstallment | null;
  hasInsufficientBalance: boolean;
  amountNeeded: number;
  walletBalance: number;
  canMakePayment: boolean;
}

/**
 * Repayment Service Interface
 */
export interface IRepaymentService {
  makeRepayment(input: MakeRepaymentInput): Promise<RepaymentResult>;
  getNextDueInstallment(userId: string, loanId?: string): Promise<UserInstallmentsSummary>;
}

/**
 * Repayment Service Implementation
 */
export class RepaymentService implements IRepaymentService {
  private walletRepository: IWalletRepository;

  constructor(
    walletRepository?: IWalletRepository
  ) {
    this.walletRepository = walletRepository || new WalletRepository();
  }

  /**
   * Make repayment from wallet
   * Rule 1: Full installment amount only
   * Rule 2: Must be the next due installment
   */
  async makeRepayment(input: MakeRepaymentInput): Promise<RepaymentResult> {
    console.log({ msg: 'Making repayment', userId: input.userId, installmentId: input.installmentId });

    // Execute in transaction to ensure atomicity
    const result = await executeWalletOperation(async (tx) => {
      // Get installment with loan details
      const installment = await tx.installment.findUnique({
        where: { id: input.installmentId },
        include: { loan: true },
      });

      if (!installment) {
        throw new NotFoundError('Installment not found');
      }

      // Verify installment belongs to user
      if (installment.loan.userId !== input.userId) {
        throw new ValidationError('Unauthorized to pay this installment');
      }

      // Check if already paid
      if (installment.status === 'PAID') {
        throw new ValidationError('This installment has already been paid');
      }

      // Rule 2: Verify this is the next due installment
      const nextDue = await tx.installment.findFirst({
        where: {
          loan: {
            userId: input.userId,
            status: { in: ['ACTIVE', 'DISBURSED'] },
          },
          status: 'PENDING',
        },
        orderBy: { dueDate: 'asc' },
      });

      if (!nextDue || nextDue.id !== input.installmentId) {
        throw new ValidationError('You can only pay the next due installment. Please pay installments in order.');
      }

      // Get wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: input.userId },
      });

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      // Rule 1: Full installment amount (including late fees)
      const amountToPay = Number(installment.amount) + Number(installment.lateFee);

      // Rule 3: Check wallet balance
      const currentBalance = Number(wallet.balance);
      if (currentBalance < amountToPay) {
        const shortfall = amountToPay - currentBalance;
        throw new ValidationError(
          `Insufficient wallet balance. Please top up your wallet with at least ₦${shortfall.toLocaleString()} to make this payment. Required: ₦${amountToPay.toLocaleString()}, Available: ₦${currentBalance.toLocaleString()}`
        );
      }

      // Calculate new balance
      const balanceBefore = currentBalance;
      const balanceAfter = balanceBefore - amountToPay;

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: input.userId },
        data: {
          balance: { decrement: amountToPay },
        },
      });

      // Generate transaction reference
      const txReference = `RPY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create transaction record
      await tx.transaction.create({
        data: {
          transactionReference: txReference,
          userId: input.userId,
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount: amountToPay,
          balanceBefore,
          balanceAfter,
          description: `Loan repayment for ${installment.loan.loanNumber} - Installment #${installment.installmentNumber}`,
          category: 'LOAN_REPAYMENT',
          status: TransactionStatus.COMPLETED,
          transactionDate: new Date(),
          metadata: {
            loanId: installment.loanId,
            installmentId: installment.id,
            installmentNumber: installment.installmentNumber,
            loanNumber: installment.loan.loanNumber,
            baseAmount: Number(installment.amount),
            lateFee: Number(installment.lateFee),
            totalAmount: amountToPay,
          },
        },
      });

      // Update installment status (always PAID for full payment)
      await tx.installment.update({
        where: { id: input.installmentId },
        data: {
          status: 'PAID',
          paidDate: new Date(),
        },
      });

      // Update loan repayment tracking
      const updatedLoan = await tx.loan.update({
        where: { id: installment.loanId },
        data: {
          amountRepaid: { increment: amountToPay },
          outstandingBalance: { decrement: amountToPay },
          lastPaymentDate: new Date(),
        },
      });

      // Check if all installments are paid
      const remainingInstallments = await tx.installment.count({
        where: {
          loanId: installment.loanId,
          status: 'PENDING',
        },
      });

      // If no more pending installments, mark loan as completed
      let finalLoanStatus = updatedLoan.status;
      if (remainingInstallments === 0) {
        const completedLoan = await tx.loan.update({
          where: { id: installment.loanId },
          data: {
            status: LoanStatus.COMPLETED,
            completionDate: new Date(),
          },
        });
        finalLoanStatus = completedLoan.status;

        console.log({ msg: 'Loan fully repaid', loanId: installment.loanId });
      }

      // Create payment record
      await tx.payment.create({
        data: {
          paymentReference: txReference,
          loanId: installment.loanId,
          installmentId: installment.id,
          userId: input.userId,
          amount: amountToPay,
          paymentMethod: 'WALLET',
          status: TransactionStatus.COMPLETED,
          paymentDate: new Date(),
          confirmedAt: new Date(),
        },
      });

      return {
        success: true,
        installmentId: installment.id,
        amountPaid: amountToPay,
        newWalletBalance: Number(updatedWallet.balance),
        installmentStatus: 'PAID' as PaymentStatus,
        loanStatus: finalLoanStatus,
        transactionReference: txReference,
      };
    });

    console.log({ 
      msg: 'Repayment completed successfully', 
      userId: input.userId,
      amount: result.amountPaid,
      reference: result.transactionReference
    });

    return result;
  }

  /**
   * Get next due installment for user
   * Rule 2: Only returns THE NEXT due installment (not all pending)
   */
  async getNextDueInstallment(userId: string, loanId?: string): Promise<UserInstallmentsSummary> {
    console.log({ msg: 'Getting next due installment', userId, loanId });

    // Get wallet balance
    const walletBalance = await this.walletRepository.getBalance(userId);

    // Get THE NEXT due installment (earliest due date)
    // FIXED: Include loan in the query
    const nextInstallment = await prisma.installment.findFirst({
      where: {
        loan: {
          userId,
          ...(loanId ? { id: loanId } : {}),
          status: { in: ['ACTIVE', 'DISBURSED'] },
        },
        status: 'PENDING',
      },
      include: {
        loan: true, // FIXED: Include loan relation
      },
      orderBy: { dueDate: 'asc' },
    });

    if (!nextInstallment) {
      // No pending installments
      return {
        nextDue: null,
        hasInsufficientBalance: false,
        amountNeeded: 0,
        walletBalance,
        canMakePayment: false,
      };
    }

    const today = new Date();
    const daysUntilDue = Math.ceil(
      (nextInstallment.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const baseAmount = Number(nextInstallment.amount);
    const lateFee = Number(nextInstallment.lateFee);
    const totalAmount = baseAmount + lateFee;

    const nextDue: NextDueInstallment = {
      id: nextInstallment.id,
      amount: baseAmount,
      dueDate: nextInstallment.dueDate,
      loanNumber: nextInstallment.loan.loanNumber,
      schoolName: nextInstallment.loan.schoolName,
      installmentNumber: nextInstallment.installmentNumber,
      daysUntilDue,
      lateFee,
      totalAmount,
    };

    // Rule 3: Check if balance is sufficient
    const hasInsufficientBalance = walletBalance < totalAmount;
    const amountNeeded = hasInsufficientBalance ? totalAmount - walletBalance : 0;

    return {
      nextDue,
      hasInsufficientBalance,
      amountNeeded,
      walletBalance,
      canMakePayment: !hasInsufficientBalance,
    };
  }
}