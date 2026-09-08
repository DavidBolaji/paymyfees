/**
 * AutoDebitService
 * Orchestrates the daily auto-debit run.
 *
 * This service deliberately contains NO money-movement logic of its own. The
 * entire debit saga (validate → check balance → debit wallet in a Serializable
 * transaction → Embedly wallet-to-wallet transfer → mark PAID → roll back on
 * failure) already lives in RepaymentService.makeRepayment(). We only decide
 * WHO to debit and WHAT to do when it fails.
 *
 * Run order matters: reconciliation goes first, so an installment freed from a
 * stuck PROCESSING state can be retried in the same run.
 *
 * Opt-in: only wallets with autoDebitEnabled = true are ever touched.
 */

import { PaymentStatus, TransactionStatus, NotificationType } from '@prisma/client';
import { prisma } from '@/src/database/prisma';
import { RepaymentService, IRepaymentService } from '@/src/services/RepaymentService';
import { EmbedlyService } from '@/src/services/EmbedlyService';
import { NotifyService } from '@/src/services/NotifyService';
import { MailService, IMailService } from '@/src/services/MailService';
import { eventLog } from '@/src/services/EventLogService';

/** How long a transfer may sit in flight before we requery Embedly for it. */
const STUCK_THRESHOLD_MINUTES = 30;
/** After this long with no definitive answer, stop trying and escalate to support. */
const STUCK_GIVE_UP_HOURS = 24;
/** Re-email a user about the same unpaid installment at most this often. */
const USER_EMAIL_INTERVAL_DAYS = 3;
/** Process this many debits concurrently. Kept low — these are real transfers. */
const BATCH_SIZE = 5;

export type AutoDebitStatus =
  | 'SUCCESS'
  | 'INSUFFICIENT_FUNDS'
  | 'NO_VIRTUAL_ACCOUNT'
  | 'TRANSFER_FAILED'
  | 'ERROR';

export interface FailureDetail {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  loanNumber: string;
  schoolName: string;
  installmentNumber: number;
  installmentId: string;
  loanId: string;
  amountDue: number;
  walletBalance: number;
  shortfall: number;
  dueDate: Date;
  daysOverdue: number;
  status: AutoDebitStatus;
  failureReason: string;
}

export interface StuckDetail {
  installmentId: string;
  transactionReference: string;
  userId: string;
  fullName: string;
  email: string;
  amount: number;
  stuckSinceHours: number;
  resolution: 'settled' | 'rolled_back' | 'still_pending' | 'gave_up';
}

export interface AutoDebitRunSummary {
  dryRun: boolean;
  attempted: number;
  succeeded: number;
  failed: number;
  skipped: number;
  totalDebited: number;
  byReason: Record<string, number>;
  errors: string[];
}

export interface ReconcileSummary {
  checked: number;
  settled: number;
  rolledBack: number;
  stillPending: number;
  gaveUp: number;
  errors: string[];
}

export class AutoDebitService {
  private repaymentService: IRepaymentService;
  private embedlyService: EmbedlyService;
  private notifyService: NotifyService;
  private mailService: IMailService;

  constructor(
    repaymentService?: IRepaymentService,
    embedlyService?: EmbedlyService,
    notifyService?: NotifyService,
    mailService?: IMailService
  ) {
    this.repaymentService = repaymentService || new RepaymentService();
    this.embedlyService = embedlyService || new EmbedlyService();
    this.notifyService = notifyService || new NotifyService();
    this.mailService = mailService || new MailService();
  }

  // ─── Reconciliation ────────────────────────────────────────────────────────

  /**
   * Resolve installments stuck in PROCESSING.
   *
   * A wallet-to-wallet transfer whose response never arrived leaves the user
   * debited with the installment never settling, and nothing retries it today.
   * We requery Embedly and drive each one to a terminal state using the
   * already-idempotent webhook handlers.
   */
  async reconcileStuckPayments(): Promise<{ summary: ReconcileSummary; stuck: StuckDetail[] }> {
    const summary: ReconcileSummary = {
      checked: 0,
      settled: 0,
      rolledBack: 0,
      stillPending: 0,
      gaveUp: 0,
      errors: [],
    };
    const stuck: StuckDetail[] = [];

    const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000);
    const giveUpCutoff = new Date(Date.now() - STUCK_GIVE_UP_HOURS * 60 * 60 * 1000);

    let pendingTransactions;
    try {
      pendingTransactions = await prisma.transaction.findMany({
        where: {
          category: 'LOAN_REPAYMENT',
          status: TransactionStatus.PENDING,
          transactionDate: { lt: cutoff },
        },
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { transactionDate: 'asc' },
        take: 200,
      });
    } catch (err) {
      summary.errors.push(`reconcile query failed: ${this.errMsg(err)}`);
      return { summary, stuck };
    }

    for (const txn of pendingTransactions) {
      summary.checked++;

      const meta = (txn.metadata ?? {}) as Record<string, unknown>;
      const installmentId = typeof meta.installmentId === 'string' ? meta.installmentId : null;
      const amount = Number(txn.amount);
      const stuckSinceHours = (Date.now() - txn.transactionDate.getTime()) / (1000 * 60 * 60);

      const base = {
        installmentId: installmentId ?? '(unknown)',
        transactionReference: txn.transactionReference,
        userId: txn.userId,
        fullName: txn.user?.fullName ?? '(unknown)',
        email: txn.user?.email ?? '(unknown)',
        amount,
        stuckSinceHours: Math.round(stuckSinceHours * 10) / 10,
      };

      try {
        const result = await this.embedlyService.getWalletToWalletStatus(txn.transactionReference);

        if (result.status === 'success') {
          await this.repaymentService.confirmRepaymentSuccess({
            customerTransactionReference: txn.transactionReference,
            status: 'success',
            amount,
          });
          summary.settled++;
          stuck.push({ ...base, resolution: 'settled' });

          await eventLog.logEvent({
            eventType: 'auto_debit.reconciled_settled',
            category: 'AUTO_DEBIT',
            severity: 'warn',
            userId: txn.userId,
            entityType: 'installment',
            entityId: installmentId,
            message: `Stuck repayment settled on requery after ${base.stuckSinceHours}h`,
            metadata: { transactionReference: txn.transactionReference, amount },
          });
          continue;
        }

        if (result.status === 'failed') {
          await this.repaymentService.rollbackRepayment({
            customerTransactionReference: txn.transactionReference,
            status: 'failed',
            amount,
            failureReason: result.message || 'Transfer failed (discovered on reconciliation requery)',
          });
          summary.rolledBack++;
          stuck.push({ ...base, resolution: 'rolled_back' });

          await eventLog.logEvent({
            eventType: 'auto_debit.reconciled_rolled_back',
            category: 'AUTO_DEBIT',
            severity: 'warn',
            userId: txn.userId,
            entityType: 'installment',
            entityId: installmentId,
            message: `Stuck repayment rolled back on requery after ${base.stuckSinceHours}h`,
            metadata: { transactionReference: txn.transactionReference, amount, reason: result.message },
          });
          continue;
        }

        // Indeterminate ('pending' or 'unknown').
        if (txn.transactionDate < giveUpCutoff) {
          summary.gaveUp++;
          stuck.push({ ...base, resolution: 'gave_up' });

          await eventLog.logEvent({
            eventType: 'auto_debit.reconcile_gave_up',
            category: 'AUTO_DEBIT',
            severity: 'error',
            userId: txn.userId,
            entityType: 'installment',
            entityId: installmentId,
            message: `Repayment unresolved after ${STUCK_GIVE_UP_HOURS}h — needs manual intervention`,
            metadata: {
              transactionReference: txn.transactionReference,
              amount,
              embedlyStatus: result.status,
              embedlyMessage: result.message,
            },
          });
        } else {
          summary.stillPending++;
          stuck.push({ ...base, resolution: 'still_pending' });
        }
      } catch (err) {
        summary.errors.push(`reconcile ${txn.transactionReference}: ${this.errMsg(err)}`);
        await eventLog.logEvent({
          eventType: 'auto_debit.reconcile_error',
          category: 'AUTO_DEBIT',
          severity: 'error',
          userId: txn.userId,
          entityType: 'installment',
          entityId: installmentId,
          message: `Reconciliation threw: ${this.errMsg(err)}`,
          metadata: { transactionReference: txn.transactionReference },
        });
      }
    }

    return { summary, stuck };
  }

  // ─── Main run ──────────────────────────────────────────────────────────────

  /**
   * Debit every opted-in user whose installment is due today or already past.
   *
   * Failures are per-user: one bad record must never abort the run.
   */
  async runDailyAutoDebit(opts: { dryRun?: boolean } = {}): Promise<{
    summary: AutoDebitRunSummary;
    failures: FailureDetail[];
  }> {
    const dryRun = opts.dryRun === true;
    const summary: AutoDebitRunSummary = {
      dryRun,
      attempted: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      totalDebited: 0,
      byReason: {},
      errors: [],
    };
    const failures: FailureDetail[] = [];

    const today = this.startOfDayUTC(new Date());
    const startOfTomorrow = this.addDays(today, 1);

    // ── 1. Candidates: due today or past, on a live loan, wallet opted in ────
    const candidates = await prisma.installment.findMany({
      where: {
        status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE] },
        dueDate: { lt: startOfTomorrow },
        loan: {
          status: { in: ['ACTIVE', 'DISBURSED'] },
          user: {
            wallet: { autoDebitEnabled: true, isActive: true },
          },
        },
      },
      include: {
        loan: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                wallet: { select: { balance: true, virtualAccountNumber: true } },
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    if (candidates.length === 0) {
      return { summary, failures };
    }

    // ── 2. Drop anything already attempted today (idempotency) ──────────────
    const attemptedToday = await prisma.autoDebitAttempt.findMany({
      where: {
        attemptDate: today,
        installmentId: { in: candidates.map((c) => c.id) },
      },
      select: { installmentId: true },
    });
    const attemptedSet = new Set(attemptedToday.map((a) => a.installmentId));

    // ── 3. One installment per loan, earliest due first ─────────────────────
    // makeRepayment enforces pay-in-order, so attempting #3 while #2 is unpaid
    // would simply throw. candidates is already ordered by dueDate ascending.
    const seenLoans = new Set<string>();
    const queue = candidates.filter((inst) => {
      if (attemptedSet.has(inst.id)) {
        summary.skipped++;
        return false;
      }
      if (seenLoans.has(inst.loanId)) {
        summary.skipped++;
        return false;
      }
      seenLoans.add(inst.loanId);
      return true;
    });

    // ── 4. Attempt each debit, in small concurrent batches ──────────────────
    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
      const batch = queue.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((inst) => this.attemptOne(inst, today, dryRun, summary))
      );
      for (const failure of results) {
        if (failure) failures.push(failure);
      }
    }

    return { summary, failures };
  }

  /**
   * Attempt a single installment. Returns a FailureDetail when the debit did
   * not succeed, so the caller can build the support digest.
   *
   * Never throws — every path is caught and recorded.
   */
  private async attemptOne(
    inst: any,
    today: Date,
    dryRun: boolean,
    summary: AutoDebitRunSummary
  ): Promise<FailureDetail | null> {
    const user = inst.loan?.user;
    if (!user?.id) {
      summary.skipped++;
      return null;
    }

    const amountDue = Number(inst.amount) + Number(inst.lateFee);
    const daysOverdue = Math.max(
      0,
      Math.floor((today.getTime() - this.startOfDayUTC(inst.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    );

    const detailBase = {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? null,
      loanNumber: inst.loan.loanNumber,
      schoolName: inst.loan.schoolName,
      installmentNumber: inst.installmentNumber,
      installmentId: inst.id,
      loanId: inst.loanId,
      amountDue,
      dueDate: inst.dueDate,
      daysOverdue,
    };

    summary.attempted++;

    try {
      // Read balance + exact shortfall up front. Cheaper than catching the
      // throw, and gives us the "top up ₦X" figure for the email.
      const nextDue = await this.repaymentService.getNextDueInstallment(user.id, inst.loanId);
      const walletBalance = nextDue.walletBalance;

      // ── Dry run: report what we would do, move no money ──────────────────
      if (dryRun) {
        const wouldSucceed = !nextDue.hasInsufficientBalance && !!user.wallet?.virtualAccountNumber;
        await eventLog.logEvent({
          eventType: 'auto_debit.dry_run',
          category: 'AUTO_DEBIT',
          severity: 'info',
          userId: user.id,
          entityType: 'installment',
          entityId: inst.id,
          message: `Dry run: would ${wouldSucceed ? 'debit' : 'fail'} ₦${amountDue} for ${inst.loan.loanNumber}`,
          metadata: { amountDue, walletBalance, shortfall: nextDue.amountNeeded, daysOverdue },
        });

        if (wouldSucceed) {
          summary.succeeded++;
          return null;
        }
        summary.failed++;
        this.bump(summary, nextDue.hasInsufficientBalance ? 'INSUFFICIENT_FUNDS' : 'NO_VIRTUAL_ACCOUNT');
        return {
          ...detailBase,
          walletBalance,
          shortfall: nextDue.amountNeeded,
          status: nextDue.hasInsufficientBalance ? 'INSUFFICIENT_FUNDS' : 'NO_VIRTUAL_ACCOUNT',
          failureReason: nextDue.hasInsufficientBalance
            ? `Short by ₦${nextDue.amountNeeded.toLocaleString()}`
            : 'No virtual account provisioned',
        };
      }

      // ── Insufficient funds: fail before touching the wallet ──────────────
      if (nextDue.hasInsufficientBalance) {
        return await this.recordFailure({
          ...detailBase,
          walletBalance,
          shortfall: nextDue.amountNeeded,
          status: 'INSUFFICIENT_FUNDS',
          failureReason: `Insufficient balance. Required ₦${amountDue.toLocaleString()}, available ₦${walletBalance.toLocaleString()}`,
          summary,
          today,
          notifyUser: true,
        });
      }

      // ── Debit ────────────────────────────────────────────────────────────
      const result = await this.repaymentService.makeRepayment({
        userId: user.id,
        installmentId: inst.id,
      });

      // The money has already moved. Bookkeeping failures past this point must
      // NOT fall through to the catch below, which would record a successful
      // debit as a failure and alert support about a payment that worked.
      try {
        await prisma.autoDebitAttempt.create({
          data: {
            installmentId: inst.id,
            userId: user.id,
            loanId: inst.loanId,
            attemptDate: today,
            status: 'SUCCESS',
            amountAttempted: amountDue,
            walletBalance,
            transactionReference: result.transactionReference,
          },
        });
      } catch (err) {
        summary.errors.push(`attempt row (post-success) ${inst.id}: ${this.errMsg(err)}`);
      }

      summary.succeeded++;
      summary.totalDebited += result.amountPaid;
      this.bump(summary, 'SUCCESS');

      await eventLog.logEvent({
        eventType: 'auto_debit.succeeded',
        category: 'AUTO_DEBIT',
        severity: 'info',
        userId: user.id,
        entityType: 'installment',
        entityId: inst.id,
        message: `Auto-debited ₦${result.amountPaid.toLocaleString()} for ${inst.loan.loanNumber} installment #${inst.installmentNumber}`,
        metadata: {
          amountPaid: result.amountPaid,
          newWalletBalance: result.newWalletBalance,
          transactionReference: result.transactionReference,
          loanStatus: result.loanStatus,
          daysOverdue,
        },
      });

      return null;
    } catch (err) {
      const message = this.errMsg(err);
      const status = this.classify(message);
      const walletBalance = Number(user.wallet?.balance ?? 0);

      return await this.recordFailure({
        ...detailBase,
        walletBalance,
        shortfall: Math.max(0, amountDue - walletBalance),
        status,
        failureReason: message,
        summary,
        today,
        // Only a funding problem is actionable by the user. A missing virtual
        // account or a provider outage is ours to fix — telling them to top up
        // would be wrong and confusing.
        notifyUser: status === 'INSUFFICIENT_FUNDS',
      });
    }
  }

  /**
   * Map RepaymentService's thrown messages onto an AutoDebitStatus.
   * The response differs per cause, so this classification drives who gets told.
   */
  private classify(message: string): AutoDebitStatus {
    const m = message.toLowerCase();
    if (m.includes('insufficient wallet balance')) return 'INSUFFICIENT_FUNDS';
    if (m.includes('virtual account is not set up')) return 'NO_VIRTUAL_ACCOUNT';
    if (m.includes('transfer') || m.includes('embedly') || m.includes('destination wallet')) {
      return 'TRANSFER_FAILED';
    }
    return 'ERROR';
  }

  /**
   * Write the attempt row, log the event, and email the user when appropriate.
   * Returns the FailureDetail for the support digest.
   */
  private async recordFailure(args: {
    userId: string;
    fullName: string;
    email: string;
    phone: string | null;
    loanNumber: string;
    schoolName: string;
    installmentNumber: number;
    installmentId: string;
    loanId: string;
    amountDue: number;
    walletBalance: number;
    shortfall: number;
    dueDate: Date;
    daysOverdue: number;
    status: AutoDebitStatus;
    failureReason: string;
    summary: AutoDebitRunSummary;
    today: Date;
    notifyUser: boolean;
  }): Promise<FailureDetail> {
    const { summary, today, notifyUser, ...detail } = args;

    summary.failed++;
    this.bump(summary, detail.status);

    // Don't email about the same unpaid installment every single day.
    let shouldEmail = false;
    if (notifyUser) {
      try {
        shouldEmail = await this.shouldEmailUser(detail.installmentId);
      } catch {
        shouldEmail = false;
      }
    }

    try {
      await prisma.autoDebitAttempt.create({
        data: {
          installmentId: detail.installmentId,
          userId: detail.userId,
          loanId: detail.loanId,
          attemptDate: today,
          status: detail.status,
          amountAttempted: detail.amountDue,
          walletBalance: detail.walletBalance,
          shortfall: detail.shortfall,
          failureReason: detail.failureReason.slice(0, 500),
          userEmailSent: shouldEmail,
          supportNotified: true,
        },
      });
    } catch (err) {
      summary.errors.push(`attempt row ${detail.installmentId}: ${this.errMsg(err)}`);
    }

    await eventLog.logEvent({
      eventType: `auto_debit.${detail.status.toLowerCase()}`,
      category: 'AUTO_DEBIT',
      severity: detail.status === 'INSUFFICIENT_FUNDS' ? 'warn' : 'error',
      userId: detail.userId,
      entityType: 'installment',
      entityId: detail.installmentId,
      message: `Auto-debit failed (${detail.status}) for ${detail.loanNumber}: ${detail.failureReason}`,
      metadata: {
        amountDue: detail.amountDue,
        walletBalance: detail.walletBalance,
        shortfall: detail.shortfall,
        daysOverdue: detail.daysOverdue,
        userEmailSent: shouldEmail,
      },
    });

    if (shouldEmail) {
      // Via NotifyService so it honours NotificationSettings and also creates
      // the in-app notification row.
      await this.notifyService.send({
        userId: detail.userId,
        type: NotificationType.WARNING,
        title: 'Top up for your loan repayment',
        message: `Your repayment of ₦${detail.amountDue.toLocaleString()} for loan ${detail.loanNumber} could not be collected. Please top up ₦${detail.shortfall.toLocaleString()}.`,
        actionUrl: '/dashboard/wallet',
        category: 'repayment',
        email: {
          to: detail.email,
          fullName: detail.fullName,
          method: (mail) =>
            mail.sendAutoDebitFailedEmail(detail.email, detail.fullName, {
              loanNumber: detail.loanNumber,
              amountDue: detail.amountDue,
              walletBalance: detail.walletBalance,
              shortfall: detail.shortfall,
              dueDate: this.formatDate(detail.dueDate),
              daysOverdue: detail.daysOverdue,
            }),
        },
      });
    }

    return detail as FailureDetail;
  }

  /**
   * First failure for an installment always emails. After that, at most once
   * every USER_EMAIL_INTERVAL_DAYS — the support digest still lists them daily.
   */
  private async shouldEmailUser(installmentId: string): Promise<boolean> {
    const lastEmailed = await prisma.autoDebitAttempt.findFirst({
      where: { installmentId, userEmailSent: true },
      orderBy: { attemptDate: 'desc' },
      select: { attemptDate: true },
    });

    if (!lastEmailed) return true;

    const daysSince = Math.floor(
      (Date.now() - lastEmailed.attemptDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= USER_EMAIL_INTERVAL_DAYS;
  }

  // ─── Support digest ────────────────────────────────────────────────────────

  /**
   * One email per run listing every failure, rather than one email per user.
   * With 50 overdue users that is 1 email instead of 50, and the pattern (e.g.
   * "every failure is NO_VIRTUAL_ACCOUNT") stays visible.
   *
   * Sent direct via MailService — support is not a User, so NotifyService and
   * its per-user settings don't apply.
   */
  async sendSupportDigest(
    failures: FailureDetail[],
    stuck: StuckDetail[],
    summary: AutoDebitRunSummary
  ): Promise<boolean> {
    const escalations = stuck.filter((s) => s.resolution === 'gave_up' || s.resolution === 'rolled_back');

    // No noise on a clean run.
    if (failures.length === 0 && escalations.length === 0) return false;

    const to = process.env.SUPPORT_EMAIL || 'support@paymyfees.co';

    return this.mailService.sendSupportAutoDebitAlertEmail(to, {
      runDate: this.formatDate(new Date()),
      failures: failures.map((f) => ({
        ...f,
        dueDate: this.formatDate(f.dueDate),
        amountDue: this.money(f.amountDue),
        walletBalance: this.money(f.walletBalance),
        shortfall: this.money(f.shortfall),
      })),
      stuck: escalations.map((s) => ({ ...s, amount: this.money(s.amount) })),
      summary,
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private bump(summary: AutoDebitRunSummary, reason: string): void {
    summary.byReason[reason] = (summary.byReason[reason] ?? 0) + 1;
  }

  private errMsg(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }

  private money(n: number): string {
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }

  private formatDate(d: Date): string {
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private startOfDayUTC(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  private addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setUTCDate(r.getUTCDate() + n);
    return r;
  }
}
