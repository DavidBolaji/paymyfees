/**
 * Cron: Payment Reminders
 * GET /api/cron/payment-reminders
 *
 * Triggered daily by GitHub Actions at 07:00 UTC.
 * Sends reminder emails at 10, 5, 3, 2, 1 days before due date
 * and overdue notices for every installment past due (once per installment).
 *
 * Protected by Authorization: Bearer <CRON_SECRET>
 */

import { NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/src/database/prisma';
import { MailService } from '@/src/services/MailService';

const REMINDER_DAYS = [10, 5, 3, 2, 1] as const;

function reminderType(days: number) {
  return `${days}_day${days !== 1 ? 's' : ''}`;
}

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

export async function GET(req: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mailService = new MailService();
  const today = startOfDay(new Date());

  let remindersSent = 0;
  let overduesSent = 0;
  const errors: string[] = [];

  try {
    // ── 1. Upcoming reminders (10 / 5 / 3 / 2 / 1 days before due) ─────────
    for (const days of REMINDER_DAYS) {
      const targetDate = addDays(today, days);
      const nextDate = addDays(targetDate, 1);
      const type = reminderType(days);

      // Find all pending installments due exactly `days` days from now
      const installments = await prisma.installment.findMany({
        where: {
          status: PaymentStatus.PENDING,
          dueDate: { gte: targetDate, lt: nextDate },
        },
        include: {
          loan: {
            include: {
              user: { select: { email: true, fullName: true } },
            },
          },
        },
      });

      if (installments.length === 0) continue;

      // Fetch already-sent reminders for these installments in one query
      const installmentIds = installments.map(i => i.id);
      const alreadySent = await prisma.paymentReminder.findMany({
        where: {
          installmentId: { in: installmentIds },
          reminderType: type,
          status: 'sent',
        },
        select: { installmentId: true },
      });
      const sentSet = new Set(alreadySent.map(r => r.installmentId));

      for (const inst of installments) {
        if (sentSet.has(inst.id)) continue;

        const user = inst.loan?.user;
        if (!user?.email) continue;

        const dueDateStr = inst.dueDate.toLocaleDateString('en-NG', {
          day: 'numeric', month: 'long', year: 'numeric',
        });

        try {
          const ok = await mailService.sendRepaymentReminderEmail(
            user.email,
            user.fullName,
            Number(inst.amount),
            dueDateStr,
            inst.loan.loanNumber,
          );

          await prisma.paymentReminder.create({
            data: {
              installmentId: inst.id,
              reminderType: type,
              sentAt: ok ? new Date() : null,
              status: ok ? 'sent' : 'failed',
            },
          });

          if (ok) remindersSent++;
        } catch (err: any) {
          errors.push(`reminder ${type} inst ${inst.id}: ${err?.message}`);
        }
      }
    }

    // ── 2. Overdue notices ──────────────────────────────────────────────────
    const overdueInstallments = await prisma.installment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: { lt: today },
      },
      include: {
        loan: {
          include: {
            user: { select: { email: true, fullName: true } },
          },
        },
      },
    });

    if (overdueInstallments.length > 0) {
      const overdueIds = overdueInstallments.map(i => i.id);
      const alreadySentOverdue = await prisma.paymentReminder.findMany({
        where: {
          installmentId: { in: overdueIds },
          reminderType: 'overdue',
          status: 'sent',
        },
        select: { installmentId: true },
      });
      const overdueSentSet = new Set(alreadySentOverdue.map(r => r.installmentId));

      for (const inst of overdueInstallments) {
        if (overdueSentSet.has(inst.id)) continue;

        const user = inst.loan?.user;
        if (!user?.email) continue;

        const daysOverdue = Math.floor(
          (today.getTime() - startOfDay(inst.dueDate).getTime()) / (1000 * 60 * 60 * 24),
        );

        try {
          const ok = await mailService.sendOverduePaymentEmail(
            user.email,
            user.fullName,
            Number(inst.amount),
            daysOverdue,
            inst.loan.loanNumber,
          );

          await prisma.paymentReminder.create({
            data: {
              installmentId: inst.id,
              reminderType: 'overdue',
              sentAt: ok ? new Date() : null,
              status: ok ? 'sent' : 'failed',
            },
          });

          if (ok) overduesSent++;
        } catch (err: any) {
          errors.push(`overdue inst ${inst.id}: ${err?.message}`);
        }
      }
    }

    console.log(`[cron/payment-reminders] remindersSent=${remindersSent} overduesSent=${overduesSent} errors=${errors.length}`);

    return NextResponse.json({
      success: true,
      remindersSent,
      overduesSent,
      errors: errors.length ? errors : undefined,
    });
  } catch (err: any) {
    console.error('[cron/payment-reminders] fatal:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
