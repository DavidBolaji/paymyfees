'use client';

/**
 * Root error boundary — catches failures in the root layout itself, which
 * app/error.tsx cannot. Must render its own <html> and <body>.
 *
 * Styles are inline because a layout-level failure may mean the stylesheet
 * never loaded.
 */

import { useEffect } from 'react';

export default function GlobalError({
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
          fatal: true,
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f6fb',
          fontFamily: 'Manrope, "Segoe UI", Arial, sans-serif',
          color: '#292929',
        }}
      >
        <div style={{ maxWidth: 460, padding: 24, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.5, color: '#6c7480', margin: '0 0 24px' }}>
            We hit an unexpected error and couldn&apos;t load the page. Our team has been notified.
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#00296b',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 22px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: 24, fontSize: 12, color: '#9aa2ae' }}>
              Reference: <span style={{ fontFamily: 'monospace' }}>{error.digest}</span>
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
