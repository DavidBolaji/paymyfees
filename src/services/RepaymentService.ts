/**
 * Repayment Service (Embedly Integration)
 * Business logic for loan repayments via Embedly inter-bank transfer
 *
 * Flow:
 * 1. Validate installment + ordering
 * 2. Check wallet balance
 * 3. Reserve (debit) wallet balance
 * 4. Initiate Embedly inter-bank transfer (ASYNC)
 * 5. Mark installment/transaction as PROCESSING
 * 6. Webhook payout.success → mark PAID + update loan
 * 7. Webhook payout.failed  → rollback: re-credit wallet, mark FAILED
 *
 * Rules:
 * - Full installment amounts only (no partial payments)
 * - Always pay the next due installment in order
 * - If insufficient balance, tell user to top up
 * - No double-submission: PROCESSING installment is locked
 */
import { WalletRepository, IWalletRepository } from '@/src/repositories/WalletRepository';

import { executeWalletOperation, prisma } from '@/src/database/prisma';
import { ValidationError, NotFoundError, PaymentError } from '@/src/types/errors';
import { EmbedlyPayoutService } from '@/src/services/EmbedlyPayoutService';

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
  gatewayReference?: string;
}

/**
 * Payout Webhook Completion Input
 * Used by WalletController when payout.success / payout.failed arrives
 */
export interface PayoutWebhookInput {
  /** Our internal reference (customerTransactionReference) */
  customerTransactionReference: string;
  /** Embedly's transaction ref stored as gatewayReference */
  gatewayReference?: string;
  status: 'success' | 'failed';
  amount?: number;
  failureReason?: string;
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
  confirmRepaymentSuccess(input: PayoutWebhookInput): Promise<void>;
  rollbackRepayment(input: PayoutWebhookInput): Promise<void>;
  getNextDueInstallment(userId: string, loanId?: string): Promise<UserInstallmentsSummary>;
}

/**
 * Repayment Service Implementation
 */
export class RepaymentService implements IRepaymentService {
  private walletRepository: IWalletRepository;
  private payoutService: EmbedlyPayoutService;

  constructor(
    walletRepository?: IWalletRepository,
    payoutService?: EmbedlyPayoutService
  ) {
    this.walletRepository = walletRepository || new WalletRepository();
    this.payoutService = payoutService || new EmbedlyPayoutService();
  }

  /**
   * Make repayment — debits wallet and initiates inter-bank payout to paymyfees
   * Installment is marked PROCESSING until payout webhook confirms success/failure
   */
  async makeRepayment(input: MakeRepaymentInput): Promise<RepaymentResult> {
    console.log({ msg: 'Making repayment', userId: input.userId, installmentId: input.installmentId });

    // ── Phase 1: Validate + Reserve Balance (DB transaction) ──────────────────
    const reservationResult = await executeWalletOperation(async (tx) => {
      const installment = await tx.installment.findUnique({
        where: { id: input.installmentId },
        include: { loan: true },
      });

      if (!installment) throw new NotFoundError('Installment not found');

      if (installment.loan.userId !== input.userId) {
        throw new ValidationError('Unauthorized to pay this installment');
      }

      // Block already-paid or already-processing installments
      if (installment.status === 'PAID') {
        throw new ValidationError('This installment has already been paid');
      }
      if ((installment.status as string) === 'PROCESSING') {
        throw new ValidationError(
          'A repayment for this installment is already being processed. Please wait for confirmation.'
        );
      }

      // Rule 2: Must be the next due installment
      const nextDue = await tx.installment.findFirst({
        where: {
          loan: {
            userId: input.userId,
            status: { in: ['ACTIVE', 'DISBURSED'] },
          },
          status: { in: ['PENDING', 'OVERDUE'] },
        },
        orderBy: { dueDate: 'asc' },
      });

      if (!nextDue || nextDue.id !== input.installmentId) {
        throw new ValidationError(
          'You can only pay the next due installment. Please pay installments in order.'
        );
      }

      const wallet = await tx.wallet.findUnique({ where: { userId: input.userId } });
      if (!wallet) throw new NotFoundError('Wallet not found');

      const virtualAccountNumber: string | null = (wallet as any).virtualAccountNumber ?? null;
      if (!virtualAccountNumber) {
        throw new ValidationError(
          'Your virtual account is not set up yet. Please contact support to complete account setup.'
        );
      }

      // Rule 1: Full installment amount (including late fees)
      const amountToPay = Number(installment.amount) + Number(installment.lateFee);
      const currentBalance = Number(wallet.balance);

      // Rule 3: Check balance INSIDE the transaction (prevents race conditions)
      if (currentBalance < amountToPay) {
        const shortfall = amountToPay - currentBalance;
        throw new ValidationError(
          `Insufficient wallet balance. Please top up at least ₦${shortfall.toLocaleString()}. Required: ₦${amountToPay.toLocaleString()}, Available: ₦${currentBalance.toLocaleString()}`
        );
      }

      const balanceBefore = currentBalance;
      const balanceAfter = balanceBefore - amountToPay;

      // Reserve the balance (debit wallet)
      const updatedWallet = await tx.wallet.update({
        where: { userId: input.userId },
        data: { balance: { decrement: amountToPay } },
      });

      // Generate unique repayment reference
      const txReference = `RPY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create transaction as PROCESSING (not completed yet)
      await tx.transaction.create({
        data: {
          transactionReference: txReference,
          userId: input.userId,
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount: amountToPay,
          balanceBefore,
          balanceAfter,
          description: `Loan repayment: ${installment.loan.loanNumber} — Installment #${installment.installmentNumber}`,
          category: 'LOAN_REPAYMENT',
          status: ('PROCESSING' as any),
          transactionDate: new Date(),
          metadata: {
            loanId: installment.loanId,
            installmentId: installment.id,
            installmentNumber: installment.installmentNumber,
            loanNumber: installment.loan.loanNumber,
            baseAmount: Number(installment.amount),
            lateFee: Number(installment.lateFee),
            totalAmount: amountToPay,
            virtualAccountNumber,
          },
        },
      });

      // Lock installment as PROCESSING
      await tx.installment.update({
        where: { id: input.installmentId },
        data: { status: 'PROCESSING' as any },
      });

      return {
        txReference,
        amountToPay,
        balanceBefore,
        balanceAfter: Number(updatedWallet.balance),
        virtualAccountNumber,
        installment,
        wallet,
      };
    });

    const { txReference, amountToPay, installment, balanceAfter, virtualAccountNumber } =
      reservationResult;

    // ── Phase 2: Initiate inter-bank payout (outside DB transaction) ───────────
    try {
      const destinationBankCode = process.env.PMF_DESTINATION_BANK_CODE;
      const destinationAccountNumber = process.env.PMF_DESTINATION_ACCOUNT_NO;
      const destinationAccountName =
        process.env.PMF_DESTINATION_ACCOUNT_NAME || 'PayMyFees Limited';

      if (!destinationBankCode || !destinationAccountNumber) {
        // Misconfiguration — rollback the reservation
        await this.performRollback(input.userId, txReference, installment.id, amountToPay, 'Server misconfiguration: destination account not configured');
        throw new PaymentError('Repayment destination account not configured', txReference);
      }

      // Build user's full name for payout
      const dbUser = await prisma.user
        .findUnique({ where: { id: input.userId }, select: { fullName: true } })
        .catch(() => null);
      const sourceAccountName = dbUser?.fullName || 'Account Holder';

      const payoutResult = await this.payoutService.interBankTransfer({
        destinationBankCode,
        destinationAccountNumber,
        destinationAccountName,
        sourceAccountNumber: virtualAccountNumber,
        sourceAccountName,
        remarks: `Loan ${installment.loan.loanNumber} Installment #${installment.installmentNumber}`,
        amount: amountToPay,
        customerTransactionReference: txReference,
        stagingStatus: process.env.EMBEDLY_ENV !== 'production' ? 'success' : undefined,
      });

      // Store the gateway reference returned by Embedly
      await prisma.transaction.updateMany({
        where: { transactionReference: txReference, userId: input.userId },
        data: { gatewayReference: payoutResult.transactionRef },
      });

      console.log({
        msg: 'Repayment payout initiated',
        userId: input.userId,
        txReference,
        gatewayReference: payoutResult.transactionRef,
        amount: amountToPay,
      });

      return {
        success: true,
        installmentId: installment.id,
        amountPaid: amountToPay,
        newWalletBalance: balanceAfter,
        installmentStatus: 'PROCESSING' as unknown as PaymentStatus,
        loanStatus: installment.loan.status,
        transactionReference: txReference,
        gatewayReference: payoutResult.transactionRef,
      };
    } catch (error) {
      // Payout API call failed — undo the wallet debit
      if (!(error instanceof PaymentError && error.message.includes('destination account'))) {
        console.error('Payout initiation failed, rolling back:', error);
        await this.performRollback(
          input.userId,
          txReference,
          installment.id,
          amountToPay,
          error instanceof Error ? error.message : 'Payout API error'
        ).catch((rbErr) => console.error('Rollback also failed:', rbErr));
      }
      throw error;
    }
  }

  /**
   * Confirm repayment success (called from payout.success webhook)
   * Marks transaction COMPLETED, installment PAID, updates loan
   */
  async confirmRepaymentSuccess(input: PayoutWebhookInput): Promise<void> {
    const { customerTransactionReference, gatewayReference } = input;
    console.log({ msg: 'Confirming repayment success', customerTransactionReference });

    await executeWalletOperation(async (tx) => {
      // Find the PROCESSING transaction by our reference
      const transaction = await tx.transaction.findFirst({
        where: {
          transactionReference: customerTransactionReference,
          status: ('PROCESSING' as any),
        },
      });

      if (!transaction) {
        // Already confirmed or unknown — idempotency safe
        console.warn({ msg: 'No PROCESSING transaction found for repayment success webhook', customerTransactionReference });
        return;
      }

      const meta = (transaction.metadata as any) ?? {};
      const installmentId: string = meta.installmentId;
      const loanId: string = meta.loanId;
      const amountPaid: number = Number(transaction.amount);

      // Mark transaction COMPLETED
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          gatewayReference: gatewayReference ?? transaction.gatewayReference,
        },
      });

      // Mark installment PAID
      await tx.installment.update({
        where: { id: installmentId },
        data: { status: 'PAID', paidDate: new Date() },
      });

      // Update loan repayment tracking
      await tx.loan.update({
        where: { id: loanId },
        data: {
          amountRepaid: { increment: amountPaid },
          outstandingBalance: { decrement: amountPaid },
          lastPaymentDate: new Date(),
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          paymentReference: customerTransactionReference,
          loanId,
          installmentId,
          userId: transaction.userId,
          amount: amountPaid,
          paymentMethod: 'WALLET',
          status: TransactionStatus.COMPLETED,
          paymentDate: new Date(),
          confirmedAt: new Date(),
        },
      }).catch((err) => console.warn('Payment record creation failed (non-fatal):', err));

      // Check if all installments paid → close loan
      const remaining = await tx.installment.count({
        where: { loanId, status: 'PENDING' },
      });

      if (remaining === 0) {
        await tx.loan.update({
          where: { id: loanId },
          data: { status: LoanStatus.COMPLETED, completionDate: new Date() },
        });
        console.log({ msg: 'Loan fully repaid', loanId });
      }
    });

    console.log({ msg: 'Repayment confirmed', customerTransactionReference });
  }

  /**
   * Rollback repayment on payout failure (called from payout.failed webhook)
   * Re-credits wallet, marks transaction FAILED, marks installment PENDING
   */
  async rollbackRepayment(input: PayoutWebhookInput): Promise<void> {
    const { customerTransactionReference, failureReason } = input;
    console.log({ msg: 'Rolling back repayment', customerTransactionReference, failureReason });

    const transaction = await prisma.transaction.findFirst({
      where: { transactionReference: customerTransactionReference },
    });

    if (!transaction) {
      console.warn({ msg: 'No transaction found for rollback', customerTransactionReference });
      return;
    }

    if (transaction.status === TransactionStatus.FAILED) {
      // Already rolled back — idempotency safe
      console.warn({ msg: 'Transaction already FAILED (duplicate webhook?)', customerTransactionReference });
      return;
    }

    const amountToRefund = Number(transaction.amount);
    const meta = (transaction.metadata as any) ?? {};
    const installmentId: string = meta.installmentId;

    await executeWalletOperation(async (tx) => {
      // Re-credit wallet
      await tx.wallet.update({
        where: { userId: transaction.userId },
        data: { balance: { increment: amountToRefund } },
      });

      // Mark transaction FAILED
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.FAILED,
          metadata: {
            ...(meta as object),
            rollbackReason: failureReason ?? 'Payout failed',
            rolledBackAt: new Date().toISOString(),
          },
        },
      });

      // Revert installment back to PENDING
      await tx.installment.update({
        where: { id: installmentId },
        data: { status: 'PENDING' },
      });
    });

    console.log({
      msg: 'Repayment rolled back',
      customerTransactionReference,
      amountRefunded: amountToRefund,
    });
  }

  // ── Private Helpers ──────────────────────────────────────────────────────────

  /** Undo a wallet debit reservation when payout initiation fails */
  private async performRollback(
    userId: string,
    txReference: string,
    installmentId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    console.warn({ msg: 'Performing repayment rollback', txReference, reason });

    await executeWalletOperation(async (tx) => {
      // Re-credit wallet
      await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });

      // Mark transaction FAILED
      await tx.transaction.updateMany({
        where: { transactionReference: txReference, userId },
        data: { status: TransactionStatus.FAILED },
      });

      // Revert installment to PENDING
      await tx.installment.update({
        where: { id: installmentId },
        data: { status: 'PENDING' },
      });
    });
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