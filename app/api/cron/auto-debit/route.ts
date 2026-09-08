/**
 * Cron: Auto-Debit
 * GET /api/cron/auto-debit
 *
 * Triggered daily by GitHub Actions at 09:00 UTC (10:00 WAT) — deliberately
 * after the 07:00 payment-reminders run, so a user reminded that morning isn't
 * debited in the same minute.
 *
 * For every wallet with autoDebitEnabled = true, collects any installment due
 * today or already past. Insufficient balance emails the user; every failure
 * goes into a single digest to support.
 *
 * Protected by Authorization: Bearer <CRON_SECRET>
 * Kill switch: AUTO_DEBIT_ENABLED=false stops it without a redeploy.
 * Pass ?dryRun=1 to compute candidates and log intent without moving money.
 */

import { NextResponse } from 'next/server';
import { AutoDebitService } from '@/src/services/AutoDebitService';
import { eventLog, runWithRequestContext } from '@/src/services/EventLogService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Kill switch ───────────────────────────────────────────────────────────
  // Checked before any work so auto-debit can be stopped instantly from the
  // Vercel dashboard.
  if (process.env.AUTO_DEBIT_ENABLED === 'false') {
    console.log('[cron/auto-debit] disabled via AUTO_DEBIT_ENABLED=false');
    return NextResponse.json({ success: true, skipped: true, reason: 'AUTO_DEBIT_ENABLED=false' });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get('dryRun') === '1' || url.searchParams.get('dryRun') === 'true';

  const requestId = `cron-autodebit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startedAt = Date.now();

  return runWithRequestContext({ requestId }, async () => {
    const service = new AutoDebitService();

    try {
      await eventLog.logEvent({
        eventType: 'auto_debit.run_started',
        category: 'AUTO_DEBIT',
        severity: 'info',
        message: `Auto-debit run started${dryRun ? ' (dry run)' : ''}`,
        metadata: { dryRun },
      });

      // ── 1. Reconcile stuck payments first ─────────────────────────────────
      // A transfer freed from PROCESSING here can be retried in the same run.
      // Skipped on a dry run: reconciliation settles and rolls back real money.
      const { summary: reconcile, stuck } = dryRun
        ? { summary: { checked: 0, settled: 0, rolledBack: 0, stillPending: 0, gaveUp: 0, errors: [] }, stuck: [] }
        : await service.reconcileStuckPayments();

      // ── 2. Debit ──────────────────────────────────────────────────────────
      const { summary, failures } = await service.runDailyAutoDebit({ dryRun });

      // ── 3. Support digest — one email, only when there is something to say ─
      let digestSent = false;
      if (!dryRun) {
        try {
          digestSent = await service.sendSupportDigest(failures, stuck, summary);
        } catch (err) {
          summary.errors.push(`support digest: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // ── 4. Keep the event_logs table bounded ──────────────────────────────
      const pruned = dryRun ? { deletedInfo: 0, deletedWarn: 0 } : await eventLog.prune();

      const durationMs = Date.now() - startedAt;

      await eventLog.logEvent({
        eventType: 'auto_debit.run_completed',
        category: 'AUTO_DEBIT',
        severity: summary.errors.length > 0 ? 'warn' : 'info',
        message: `Auto-debit run finished: ${summary.succeeded} succeeded, ${summary.failed} failed`,
        durationMs,
        metadata: { dryRun, summary, reconcile, digestSent, pruned },
      });

      console.log(
        `[cron/auto-debit] dryRun=${dryRun} attempted=${summary.attempted} ok=${summary.succeeded} ` +
          `failed=${summary.failed} skipped=${summary.skipped} reconciled=${reconcile.checked} ` +
          `errors=${summary.errors.length} ${durationMs}ms`
      );

      return NextResponse.json({
        success: true,
        requestId,
        durationMs,
        autoDebit: summary,
        reconcile,
        digestSent,
        pruned,
      });
    } catch (err: any) {
      const durationMs = Date.now() - startedAt;
      console.error('[cron/auto-debit] fatal:', err);

      await eventLog.logEvent({
        eventType: 'auto_debit.run_failed',
        category: 'AUTO_DEBIT',
        severity: 'error',
        message: `Auto-debit run threw: ${err?.message ?? 'unknown'}`,
        durationMs,
        metadata: { stack: err?.stack },
      });

      return NextResponse.json({ success: false, requestId, error: err?.message }, { status: 500 });
    }
  });
}
