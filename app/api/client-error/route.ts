/**
 * Client Error Ingest
 * POST /api/client-error
 *
 * Receives errors caught by the React error boundaries. Without this, a client
 * render error is completely invisible — there is no external error tracker and
 * a crashed browser tab never reaches server logs.
 *
 * Deliberately unauthenticated: an error boundary may fire before or after auth
 * resolves, and losing the report would defeat the purpose. Kept safe by being
 * rate-limited, size-capped, and write-only.
 */

import { NextResponse } from 'next/server';
import { eventLog } from '@/src/services/EventLogService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Max accepted payload. Stack traces are long; anything bigger is abuse. */
const MAX_BODY_BYTES = 16 * 1024;

/**
 * Per-IP rate limit. In-memory, so on serverless it is per-instance and
 * approximate — enough to stop a runaway render loop from writing thousands of
 * rows, which is all it needs to do.
 */
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    // Opportunistic sweep — no timers, which leak in a lambda.
    if (hits.size > 1000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (rateLimited(ip)) {
      return NextResponse.json({ success: false, error: 'rate_limited' }, { status: 429 });
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ success: false, error: 'payload_too_large' }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 });
    }

    const message = typeof body.message === 'string' ? body.message : 'Unknown client error';

    await eventLog.logEvent({
      eventType: 'client.error',
      category: 'CLIENT',
      severity: 'error',
      userId: typeof body.userId === 'string' ? body.userId : null,
      requestId: typeof body.digest === 'string' ? body.digest : null,
      message: `Client error: ${message}`,
      // redact() runs on every write, so a stack containing a token is scrubbed.
      metadata: {
        stack: typeof body.stack === 'string' ? body.stack : null,
        path: typeof body.path === 'string' ? body.path : null,
        digest: typeof body.digest === 'string' ? body.digest : null,
        userAgent: req.headers.get('user-agent'),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[client-error] ingest failed', err);
    // Never surface a failure here — the client is already broken.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
