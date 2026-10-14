import type { JournalEntry } from '../../types';
import { currencyOf, metrics, netOf, timestampMs } from './journalMath';
import { addDays, addMonth, monthBounds } from './journalOverview';

export interface DateRange { from: string; to: string }
export const RANGE_PRESETS = ['Today', 'This week', 'This month', 'Calendar month', 'Last 7 days', 'Last 30 days', 'Last month', 'This quarter', 'Year to date'] as const;
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}
export const validRange = (range: DateRange) => validDate(range.from) && validDate(range.to) && range.from <= range.to;
export function presetRange(preset: typeof RANGE_PRESETS[number], today: string): DateRange {
  const month = today.slice(0, 7);
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  switch (preset) {
    case 'Today': return { from: today, to: today };
    case 'This week': return { from: addDays(today, -(weekday + 6) % 7), to: today };
    case 'This month': return { from: `${month}-01`, to: today };
    case 'Calendar month': { const [from, to] = monthBounds(month); return { from, to }; }
    case 'Last 7 days': return { from: addDays(today, -6), to: today };
    case 'Last 30 days': return { from: addDays(today, -29), to: today };
    case 'Last month': { const [from, to] = monthBounds(addMonth(month, -1)); return { from, to }; }
    case 'This quarter': return { from: `${today.slice(0, 4)}-${String(Math.floor((Number(today.slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, '0')}-01`, to: today };
    case 'Year to date': return { from: `${today.slice(0, 4)}-01-01`, to: today };
  }
}

// The same entry-date cohort as the journal. No guessed intraday fills or currency conversion.
export function daySummary(entries: JournalEntry[]) {
  if (new Set(entries.map(currencyOf)).size > 1) throw new Error('Select one account currency before combining money results.');
  const net = metrics(entries), gross = metrics(entries, 'gross');
  const holds = net.list.map(e => timestampMs(e.exitTime) - timestampMs(e.entryTime)).filter(n => Number.isFinite(n) && n >= 0);
  const timestampCoverage = net.list.filter(e => Number.isFinite(timestampMs(e.entryTime))).length;
  const ordered = [...net.list].sort((a, b) => timestampCoverage === net.n ? timestampMs(a.entryTime) - timestampMs(b.entryTime) || a.id.localeCompare(b.id) : a.id.localeCompare(b.id));
  let running = 0;
  return { net, gross, holdCount: holds.length, averageHold: holds.length ? holds.reduce((a, b) => a + b, 0) / holds.length : null,
    timestampCoverage,
    curve: ordered.map(e => ({ id: e.id, time: e.entryTime, value: running = Math.round((running + netOf(e)) * 100) / 100 })) };
}
