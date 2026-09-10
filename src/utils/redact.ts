/**
 * Redaction for persisted log metadata.
 *
 * Deliberately dependency-free so it can be unit-tested in isolation and reused
 * anywhere without dragging in Prisma.
 *
 * This matters more than console-log hygiene: event_logs rows are durable and
 * queryable. A secret in Vercel's rolling buffer disappears within the hour; a
 * secret written here is permanent.
 */

/**
 * Keys whose values must never be persisted. Matched as normalized substrings,
 * so `x-api-key`, `apiKey` and `EMBEDLY_API_KEY` all match.
 */
const REDACT_KEYS = [
  'password',
  'token',
  'authorization',
  'auth',
  'apikey',
  'api_key',
  'x-api-key',
  'secret',
  'signature',
  'sig',
  'hash',
  'bvn',
  'nin',
  'cardnumber',
  'card_number',
  'pan',
  'cvv',
  'cvc',
  'pin',
  'otp',
  'cookie',
  'sessionid',
];

/** Account-number keys — masked to the last 4 digits rather than dropped, so
 *  a support agent can still match a row to a transaction. */
const MASK_KEYS = ['accountnumber', 'account_number', 'fromaccount', 'toaccount', 'virtualaccountnumber'];

const MAX_STRING_LENGTH = 500;
const MAX_DEPTH = 5;
const MAX_ARRAY_ITEMS = 50;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_\s]/g, '');
}

const NORMALIZED_REDACT = REDACT_KEYS.map(normalizeKey);
const NORMALIZED_MASK = MASK_KEYS.map(normalizeKey);

function maskAccount(value: unknown): string {
  const str = String(value);
  if (str.length <= 4) return '****';
  return `****${str.slice(-4)}`;
}

/**
 * Strip or mask sensitive values from arbitrary metadata before persisting.
 * Applied to every EventLog write.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth > MAX_DEPTH) return '[max depth]';

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…[truncated]` : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();

  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack?.slice(0, 2000) };
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => redact(item, depth + 1));
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const norm = normalizeKey(key);

      // Mask before redact: "virtualAccountNumber" would otherwise be caught by
      // no redact key, but "accountNumber" must stay matchable, not vanish.
      if (NORMALIZED_MASK.includes(norm)) {
        out[key] = maskAccount(val);
        continue;
      }

      if (NORMALIZED_REDACT.some((k) => norm.includes(k))) {
        out[key] = '[redacted]';
        continue;
      }

      out[key] = redact(val, depth + 1);
    }
    return out;
  }

  return String(value);
}
