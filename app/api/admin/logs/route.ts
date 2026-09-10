/**
 * Admin Event Logs API
 * GET /api/admin/logs
 *
 * Reads the event_logs trail — the durable record of what happened to each
 * user. Admin-only: these rows describe other people's financial activity.
 *
 * Query params:
 *   userId, requestId, category, severity, eventType, entityId
 *   q       — substring match on message
 *   from,to — ISO dates
 *   limit   — max 200, default 50
 *   cursor  — id of the last row from the previous page
 */

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/src/database/prisma';
import { adminAuthMiddleware, authMiddleware } from '@/src/middleware/authMiddleware';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { lenientRateLimiter } from '@/src/middleware/rateLimiter';

export const dynamic = 'force-dynamic';

export const GET = asyncHandler(async (req: Request): Promise<NextResponse> => {
  await lenientRateLimiter(req);

  const authResult = await authMiddleware(req);
  if (!authResult.success) {
    return authResult.response || NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  const adminResult = await adminAuthMiddleware(req);
  if (!adminResult.success) {
    return adminResult.response || NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
  }

  const params = new URL(req.url).searchParams;
  const limit = Math.min(Number(params.get('limit')) || 50, 200);
  const cursor = params.get('cursor');

  const where: Prisma.EventLogWhereInput = {};
  const userId = params.get('userId');
  const requestId = params.get('requestId');
  const category = params.get('category');
  const severity = params.get('severity');
  const eventType = params.get('eventType');
  const entityId = params.get('entityId');
  const q = params.get('q');
  const from = params.get('from');
  const to = params.get('to');

  if (userId) where.userId = userId;
  if (requestId) where.requestId = requestId;
  if (category) where.category = category;
  if (severity) where.severity = severity;
  if (eventType) where.eventType = eventType;
  if (entityId) where.entityId = entityId;
  if (q) where.message = { contains: q };
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const rows = await prisma.eventLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  // Attach user identity in one extra query rather than a join, since EventLog
  // deliberately has no FK on userId (log rows outlive the users they describe).
  const userIds = Array.from(new Set(page.map((r) => r.userId).filter((v): v is string => !!v)));
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullName: true, email: true },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json({
    success: true,
    data: {
      logs: page.map((r) => ({
        ...r,
        user: r.userId ? userMap.get(r.userId) ?? null : null,
      })),
      nextCursor: hasMore && page.length > 0 ? page[page.length - 1]!.id : null,
    },
    metadata: { timestamp: new Date().toISOString() },
  });
});
