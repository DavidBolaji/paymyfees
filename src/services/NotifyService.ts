/**
 * NotifyService
 * Central notification dispatcher — checks NotificationSettings before creating
 * in-app notifications or sending emails.
 *
 * Category mapping:
 *   wallet_funding   → notificationSettings.walletFunding
 *   loan_approval    → notificationSettings.loanApproval
 *   repayment        → notificationSettings.repaymentReminders
 *   verification     → notificationSettings.verificationStatus
 *   (everything else) → always sent if the global toggle is on
 */

import { prisma } from '@/src/database/prisma';
import { NotificationType } from '@prisma/client';
import { MailService, IMailService } from './MailService';

export type NotifyCategory =
  | 'wallet_funding'
  | 'loan_approval'
  | 'repayment'
  | 'verification'
  | 'general';

export interface NotifyOptions {
  /** The target user's ID */
  userId: string;
  /** Prisma NotificationType */
  type: NotificationType;
  /** Short notification title */
  title: string;
  /** Body message */
  message: string;
  /** Optional deep-link route */
  actionUrl?: string;
  /** Category used to look up the per-topic toggle in NotificationSettings */
  category: NotifyCategory;
  /** When provided the service also sends an email */
  email?: {
    to: string;
    fullName: string;
    /** One of the MailService send methods */
    method: (mail: IMailService) => Promise<boolean>;
  };
}

export class NotifyService {
  private mail: IMailService;

  constructor(mail?: IMailService) {
    this.mail = mail ?? new MailService();
  }

  /**
   * Dispatch a notification respecting the user's settings.
   * Failures are swallowed so they never break the calling transaction.
   */
  async send(opts: NotifyOptions): Promise<void> {
    try {
      // Fetch settings (default to all-enabled when not yet seeded)
      const settings = await prisma.notificationSettings
        .findUnique({ where: { userId: opts.userId } })
        .catch(() => null);

      const inApp = settings?.inAppNotifications ?? true;
      const emailEnabled = settings?.emailNotifications ?? true;

      // Per-category toggle
      const categoryEnabled = this.isCategoryEnabled(settings, opts.category);

      // --- In-app notification ---
      if (inApp && categoryEnabled) {
        await prisma.notification
          .create({
            data: {
              userId: opts.userId,
              type: opts.type,
              title: opts.title,
              message: opts.message,
              actionUrl: opts.actionUrl ?? null,
            },
          })
          .catch((err) => console.error('[NotifyService] Failed to create notification', err));
      }

      // --- Email notification ---
      if (emailEnabled && categoryEnabled && opts.email) {
        await opts.email.method(this.mail).catch((err) =>
          console.error('[NotifyService] Failed to send email', err)
        );
      }
    } catch (err) {
      console.error('[NotifyService] Unexpected error', err);
    }
  }

  private isCategoryEnabled(
    settings: Awaited<ReturnType<typeof prisma.notificationSettings.findUnique>>,
    category: NotifyCategory
  ): boolean {
    if (!settings) return true; // default: all enabled
    switch (category) {
      case 'wallet_funding':
        return settings.walletFunding;
      case 'loan_approval':
        return settings.loanApproval;
      case 'repayment':
        return settings.repaymentReminders;
      case 'verification':
        return settings.verificationStatus;
      default:
        return true;
    }
  }
}
