'use client';

/**
 * Route-level error boundary.
 *
 * Reports to /api/client-error so the failure lands in event_logs — there is no
 * external error tracker, so without this a client crash leaves no trace at all.
 */

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          path: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
        keepalive: true,
      }).catch(() => {
        /* reporting must never make things worse */
      });
    } catch {
      /* ignore */
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="mb-3 text-xl font-bold text-[#292929]">Something went wrong</h2>
      <p className="mb-6 max-w-md text-sm text-[#6c7480]">
        We hit an unexpected error. Our team has been notified. You can try again, or head back to
        your dashboard.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-[#00296b] px-5 py-2.5 text-sm font-bold text-white"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="rounded-lg border border-[#d9dfe8] px-5 py-2.5 text-sm font-bold text-[#00296b]"
        >
          Go to dashboard
        </a>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-[#9aa2ae]">
          Reference: <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </div>
  );
}
