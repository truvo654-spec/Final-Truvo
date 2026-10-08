// Number and date formatting for the Backtesting screens.
import type { Currency } from './types';

export const CUR_SYMBOL: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£' };
const MINUS = '−';

export function money(n: number, cur: Currency = 'USD', dp = 2, signed = true): string {
  if (!Number.isFinite(n)) return '—';
  const s = CUR_SYMBOL[cur] + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  if (!signed) return n < 0 ? MINUS + s : s;
  return (n > 0 ? '+' : n < 0 ? MINUS : '') + s;
}
export const pct = (x: number, dp = 1, signed = false) => (Number.isFinite(x) ? `${signed && x > 0 ? '+' : x < 0 ? MINUS : ''}${Math.abs(x * 100).toFixed(dp)}%` : '—');
export const rr = (x: number | null | undefined, dp = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : `${x > 0 ? '+' : x < 0 ? MINUS : ''}${Math.abs(x).toFixed(dp)}R`);
export const num = (x: number | null | undefined, dp = 2) => (x === null || x === undefined ? '∞' : Number.isFinite(x) ? x.toFixed(dp) : '—');
export const priceFmt = (x: number, dp: number) => (Number.isFinite(x) ? x.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }) : '—');
export const signed = (x: number, dp = 2) => `${x > 0 ? '+' : x < 0 ? MINUS : ''}${Math.abs(x).toFixed(dp)}`;
export const tone = (x: number) => (x > 0 ? 'text-emerald-600' : x < 0 ? 'text-rose-600' : 'text-slate-500');

export const userTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } })();

const cache = new Map<string, Intl.DateTimeFormat>();
const fmt = (tz: string, kind: 'dt' | 'd' | 'day' | 'hm') => {
  const k = `${tz}|${kind}`;
  let f = cache.get(k);
  if (!f) {
    const o: Intl.DateTimeFormatOptions = kind === 'dt' ? { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
      : kind === 'd' ? { year: 'numeric', month: 'short', day: '2-digit' }
      : kind === 'day' ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
    f = new Intl.DateTimeFormat(kind === 'day' ? 'en-CA' : 'en-US', { ...o, timeZone: tz });
    cache.set(k, f);
  }
  return f;
};
export const dateTime = (t: number, tz = userTz) => fmt(tz, 'dt').format(new Date(t));
export const dateOnly = (t: number, tz = userTz) => fmt(tz, 'd').format(new Date(t));
/** YYYY-MM-DD in the given time zone (for inclusive date filters). */
export const dayIn = (t: number, tz = userTz) => fmt(tz, 'day').format(new Date(t));
export const hourMin = (t: number, tz = userTz) => fmt(tz, 'hm').format(new Date(t));

/** "07:00–16:00 UTC" shown with the user's local equivalent. */
export function utcWindow(start: number, end: number, tz = userTz): string {
  const base = Date.UTC(2026, 0, 6);
  const s = hourMin(base + start * 3600000, tz), e = hourMin(base + (end % 24) * 3600000, tz);
  const p = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;
  return tz === 'UTC' ? `${p(start)}–${p(end)} UTC` : `${p(start)}–${p(end)} UTC (${s}–${e} your time)`;
}

export const holdText = (min: number) => (min < 60 ? `${Math.round(min)}m` : min < 1440 ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}m` : `${(min / 1440).toFixed(1)}d`);
