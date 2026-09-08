/**
 * EventLogService
 * Durable, queryable application event trail stored in our own database.
 *
 * This is the "user journey" record. The app runs on Vercel serverless, so there
 * is no log file to tail and Vercel's runtime logs are a short rolling buffer
 * that cannot be joined to a userId. Anything we want to be able to look up
 * later has to be written here.
 *
 * Two rules, both non-negotiable:
 *
 *   1. Logging must NEVER break business logic. Every write is swallowed.
 *   2. NEVER call this inside executeWalletOperation(). If the wallet
 *      transaction rolls back the log row vanishes — and the rollback is
 *      precisely the event worth keeping. Log after the transaction settles,
 *      on both the success and the failure path.
 */

import { AsyncLocalStorage } from 'async_hooks';
import { prisma } from '@/src/database/prisma';
import { redact } from '@/src/utils/redact';

// Re-exported so existing importers of EventLogService keep working.
export { redact };

export type EventSeverity = 'debug' | 'info' | 'warn' | 'error';

export type EventCategory =
  | 'AUTH'
  | 'WALLET'
  | 'LOAN'
  | 'REPAYMENT'
  | 'AUTO_DEBIT'
  | 'EMBEDLY'
  | 'EMAIL'
  | 'HTTP'
  | 'CLIENT'
  | 'SYSTEM';

export interface LogEventInput {
  eventType: string;
  category: EventCategory;
  severity?: EventSeverity;
  userId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  /** Omit to pick up the ambient request id from asyncHandler */
  requestId?: string | null;
  message: string;
  metadata?: Record<string, unknown> | null;
  durationMs?: number | null;
}

export interface UserJourneyQuery {
  limit?: number;
  cursor?: string;
  category?: EventCategory;
  severity?: EventSeverity;
  from?: Date;
  to?: Date;
}

/**
 * Ambient request context.
 *
 * asyncHandler seeds this once per request so that services nested many layers
 * deep can attach the correlation id without every function signature having to
 * thread a requestId parameter through.
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
}

const requestContextStore = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return requestContextStore.run(ctx, fn);
}

export function getRequestContext(): RequestContext | undefined {
  return requestContextStore.getStore();
}

/** Attach the user id to the in-flight request context, once auth has resolved. */
export function setContextUserId(userId: string): void {
  const ctx = requestContextStore.getStore();
  if (ctx) ctx.userId = userId;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface IEventLogService {
  logEvent(input: LogEventInput): Promise<void>;
  logEventBatch(inputs: LogEventInput[]): Promise<void>;
  getUserJourney(userId: string, query?: UserJourneyQuery): Promise<{ events: unknown[]; nextCursor: string | null }>;
  prune(): Promise<{ deletedInfo: number; deletedWarn: number }>;
}

export class EventLogService implements IEventLogService {
  /**
   * Write one event. Fire-and-forget: any failure is swallowed and reported to
   * console only. A failed audit insert must never roll back a repayment.
   */
  async logEvent(input: LogEventInput): Promise<void> {
    try {
      const ctx = getRequestContext();

      await prisma.eventLog.create({
        data: {
          eventType: input.eventType,
          category: input.category,
          severity: input.severity ?? 'info',
          userId: input.userId ?? ctx?.userId ?? null,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
          requestId: input.requestId ?? ctx?.requestId ?? null,
          message: input.message.slice(0, 500),
          metadata: input.metadata ? (redact(input.metadata) as object) : undefined,
          durationMs: input.durationMs ?? null,
        },
      });
    } catch (err) {
      // Never rethrow — logging must not be able to fail a request.
      console.error('[EventLogService] Failed to write event', {
        eventType: input.eventType,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Batch write. Used by the cron, which produces many rows per run and would
   * otherwise issue one round trip per event.
   */
  async logEventBatch(inputs: LogEventInput[]): Promise<void> {
    if (inputs.length === 0) return;

    try {
      const ctx = getRequestContext();

      await prisma.eventLog.createMany({
        data: inputs.map((input) => ({
          eventType: input.eventType,
          category: input.category,
          severity: input.severity ?? 'info',
          userId: input.userId ?? ctx?.userId ?? null,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
          requestId: input.requestId ?? ctx?.requestId ?? null,
          message: input.message.slice(0, 500),
          metadata: input.metadata ? (redact(input.metadata) as object) : undefined,
          durationMs: input.durationMs ?? null,
        })),
      });
    } catch (err) {
      console.error('[EventLogService] Failed to write event batch', {
        count: inputs.length,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Everything that happened to one user, newest first, cursor-paginated.
   */
  async getUserJourney(userId: string, query: UserJourneyQuery = {}) {
    const limit = Math.min(query.limit ?? 50, 200);

    const events = await prisma.eventLog.findMany({
      where: {
        userId,
        ...(query.category ? { category: query.category } : {}),
        ...(query.severity ? { severity: query.severity } : {}),
        ...(query.from || query.to
          ? {
              createdAt: {
                ...(query.from ? { gte: query.from } : {}),
                ...(query.to ? { lte: query.to } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = events.length > limit;
    const page = hasMore ? events.slice(0, limit) : events;

    return {
      events: page,
      nextCursor: hasMore && page.length > 0 ? page[page.length - 1]!.id : null,
    };
  }

  /**
   * Keep the table bounded. This lives in our primary MySQL, so it grows
   * without limit unless something trims it. Called from the daily cron.
   *
   * Low-signal rows go after 90 days; warnings and errors are kept a year.
   */
  async prune(): Promise<{ deletedInfo: number; deletedWarn: number }> {
    const now = Date.now();
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);

    try {
      const info = await prisma.eventLog.deleteMany({
        where: { severity: { in: ['debug', 'info'] }, createdAt: { lt: ninetyDaysAgo } },
      });

      const warn = await prisma.eventLog.deleteMany({
        where: { severity: { in: ['warn', 'error'] }, createdAt: { lt: oneYearAgo } },
      });

      return { deletedInfo: info.count, deletedWarn: warn.count };
    } catch (err) {
      console.error('[EventLogService] Prune failed', err);
      return { deletedInfo: 0, deletedWarn: 0 };
    }
  }
}

/** Shared instance — this service is stateless. */
export const eventLog = new EventLogService();
