'use client';

/**
 * Admin → Event Logs
 *
 * The window onto event_logs. Without this the trail is only reachable through
 * Prisma Studio, which makes it useless in practice.
 *
 * Two views: a filtered feed, and — when you click a row's request id — every
 * event from that single request, in order. That second view is what turns a
 * pile of rows into a readable user journey.
 */

import { useState, useEffect, useCallback, Fragment } from 'react';
import { api } from '@/src/lib/api';

const CATEGORIES = [
  'AUTH',
  'WALLET',
  'LOAN',
  'REPAYMENT',
  'AUTO_DEBIT',
  'EMBEDLY',
  'EMAIL',
  'HTTP',
  'CLIENT',
  'SYSTEM',
];

const SEVERITIES = ['debug', 'info', 'warn', 'error'];

interface LogRow {
  id: string;
  eventType: string;
  category: string;
  severity: string;
  userId: string | null;
  entityType: string | null;
  entityId: string | null;
  requestId: string | null;
  message: string;
  metadata: unknown;
  durationMs: number | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string } | null;
}

const SEVERITY_STYLES: Record<string, string> = {
  error: 'bg-red-50 text-red-700 border-red-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  debug: 'bg-gray-100 text-gray-600 border-gray-200',
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    q: '',
    category: '',
    severity: '',
    userId: '',
    requestId: '',
  });

  const buildQuery = useCallback(
    (cursor?: string) => {
      const p = new URLSearchParams();
      if (filters.q) p.set('q', filters.q);
      if (filters.category) p.set('category', filters.category);
      if (filters.severity) p.set('severity', filters.severity);
      if (filters.userId) p.set('userId', filters.userId);
      if (filters.requestId) p.set('requestId', filters.requestId);
      if (cursor) p.set('cursor', cursor);
      p.set('limit', '50');
      return p.toString();
    },
    [filters]
  );

  const load = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/admin/logs?${buildQuery(cursor)}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to load logs');
        setLogs((prev) => (cursor ? [...prev, ...json.data.logs] : json.data.logs));
        setNextCursor(json.data.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  // Refetch whenever a filter changes.
  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#292929]">Event Logs</h1>
        <p className="mt-1 text-sm text-[#6c7480]">
          Durable application trail. Click a request ID to see every event from that request.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={filters.q}
          onChange={(e) => setFilter('q', e.target.value)}
          placeholder="Search message…"
          className="h-9 min-w-[220px] flex-1 rounded-lg border border-[#d9dfe8] px-3 text-sm outline-none focus:border-[#00296b]"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilter('category', e.target.value)}
          className="h-9 rounded-lg border border-[#d9dfe8] px-3 text-sm outline-none focus:border-[#00296b]"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filters.severity}
          onChange={(e) => setFilter('severity', e.target.value)}
          className="h-9 rounded-lg border border-[#d9dfe8] px-3 text-sm outline-none focus:border-[#00296b]"
        >
          <option value="">All severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {activeFilters.length > 0 && (
          <button
            onClick={() => setFilters({ q: '', category: '', severity: '', userId: '', requestId: '' })}
            className="h-9 rounded-lg border border-[#d9dfe8] px-3 text-sm font-medium text-[#6c7480] hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Scoped-view banner */}
      {(filters.requestId || filters.userId) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#edf2fa] px-4 py-2.5 text-sm text-[#00296b]">
          <span className="font-semibold">
            {filters.requestId ? 'Request' : 'User'} journey:
          </span>
          <span className="font-mono text-xs">{filters.requestId || filters.userId}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#eef1f6] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eef1f6] bg-[#fafbfd] text-left text-xs font-semibold uppercase tracking-wide text-[#6c7480]">
              <th className="whitespace-nowrap px-4 py-3">Time</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">User</th>
              <th className="whitespace-nowrap px-4 py-3">Request</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row) => (
              <Fragment key={row.id}>
                <tr
                  onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                  className="cursor-pointer border-b border-[#f4f6fa] hover:bg-[#fafbfd]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#6c7480]">
                    {fmtTime(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                        SEVERITY_STYLES[row.severity] ?? SEVERITY_STYLES.debug
                      }`}
                    >
                      {row.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-[#00296b]">
                    {row.category}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#6c7480]">
                    {row.eventType}
                  </td>
                  <td className="max-w-md px-4 py-3 text-[#292929]">{row.message}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {row.user ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilter('userId', row.user!.id);
                        }}
                        className="text-left text-[#00296b] hover:underline"
                      >
                        {row.user.fullName}
                        <span className="block text-[11px] text-[#9aa2ae]">{row.user.email}</span>
                      </button>
                    ) : (
                      <span className="text-[#c3c9d4]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.requestId ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilter('requestId', row.requestId!);
                        }}
                        className="font-mono text-[11px] text-[#00296b] hover:underline"
                        title="Show every event from this request"
                      >
                        {row.requestId.slice(0, 12)}…
                      </button>
                    ) : (
                      <span className="text-[#c3c9d4]">—</span>
                    )}
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr className="border-b border-[#f4f6fa] bg-[#fafbfd]">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="grid gap-3 text-xs md:grid-cols-2">
                        <div>
                          <span className="font-semibold text-[#6c7480]">Entity: </span>
                          <span className="font-mono">
                            {row.entityType ?? '—'} {row.entityId ?? ''}
                          </span>
                          {row.durationMs != null && (
                            <>
                              <span className="ml-4 font-semibold text-[#6c7480]">Duration: </span>
                              <span>{row.durationMs}ms</span>
                            </>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <div className="mb-1 font-semibold text-[#6c7480]">Metadata</div>
                          <pre className="max-h-64 overflow-auto rounded-lg bg-white p-3 font-mono text-[11px] leading-relaxed text-[#292929]">
                            {JSON.stringify(row.metadata ?? {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}

            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#9aa2ae]">
                  No events match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {loading && <span className="text-sm text-[#9aa2ae]">Loading…</span>}
        {!loading && nextCursor && (
          <button
            onClick={() => load(nextCursor)}
            className="rounded-lg border border-[#d9dfe8] px-5 py-2 text-sm font-semibold text-[#00296b] hover:bg-gray-50"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
