export function formatINR(value: number | null | undefined, decimals = false): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0
  }).format(value);
}

export function compactINR(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (value >= 10000000) return `₹${round(value / 10000000)} Cr`;
  if (value >= 100000) return `₹${round(value / 100000)} L`;
  if (value >= 1000) return `₹${round(value / 1000)} K`;
  return `₹${round(value)}`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${Number(value.toFixed(decimals))}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function parseAmountInput(raw: string): number | undefined {
  const digits = raw.replace(/[^0-9.]/g, '');
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isNaN(n) ? undefined : n;
}

export function titleCase(value: string): string {
  return value.
  split(/[\s_]+/).
  map((w) => w ? w[0].toUpperCase() + w.slice(1) : w).
  join(' ');
}

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}