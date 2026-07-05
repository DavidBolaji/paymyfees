export type ApiFieldError = {
  field?: string;
  message?: string;
};

export type ApiErrorPayload = {
  error?: string;
  message?: string;
  errors?: ApiFieldError[];
};

const TECHNICAL_ERROR_HINTS = [
  'internal',
  'database',
  'prisma',
  'transaction failed',
  'embedly customer',
  'embedly wallet',
  'lookup exhausted',
  'stack',
];

export function normalizeNigerianPhone(value: string): string {
  const trimmed = value.replace(/\s/g, '');

  if (trimmed.startsWith('+2340')) {
    return `+234${trimmed.slice(5)}`;
  }

  if (trimmed.startsWith('2340')) {
    return `+234${trimmed.slice(4)}`;
  }

  if (trimmed.startsWith('234')) {
    return `+${trimmed}`;
  }

  if (/^[789]\d{9}$/.test(trimmed)) {
    return `+234${trimmed}`;
  }

  return trimmed;
}

export function validateNigerianPhone(value: string): string | undefined {
  const normalized = normalizeNigerianPhone(value);

  if (!normalized) {
    return 'Phone number is required';
  }

  if (!/^\+234[789]\d{9}$/.test(normalized) && !/^0[789]\d{9}$/.test(normalized)) {
    return 'Enter a valid Nigerian phone number (e.g. 08012345678)';
  }

  return undefined;
}

export function getReadableAuthError(data?: ApiErrorPayload): string {
  const firstValidationError = data?.errors?.find((item) => item.message)?.message;
  const candidate = data?.message || firstValidationError || data?.error || '';
  const lower = candidate.toLowerCase();

  if (lower.includes('already exists') || lower.includes('already registered') || lower.includes('conflict')) {
    return 'This email or phone number is already registered.';
  }

  if (lower.includes('payment wallet') || lower.includes('payment account') || lower.includes('provision')) {
    return 'We could not create your payment wallet right now. Please try again.';
  }

  if (!candidate || TECHNICAL_ERROR_HINTS.some((hint) => lower.includes(hint))) {
    return 'We could not complete registration right now. Please try again shortly.';
  }

  return candidate;
}
